import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  appendTrimmed,
  BLOCK_KEYS,
  citationsOf,
  copyingOf,
  CONTEXT,
  fullSha256Of,
  intersectRanges,
  isWide,
  keepingRanges,
  keptRanges,
  main,
  planCapture,
  replaceTrimmed,
  RULING,
  trimLines,
  trimStore,
  WIDE_LINES,
  WIDE_RULING,
  widePass,
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
  recordFiles,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/freeze-capture.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { classifyCapture, readCapture } from "../../../scripts/capture-check.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { siteOf } from "../../../scripts/queue-zero-test.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { planRemask } from "../../../scripts/remask-captures.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { copyingBarredSite, extractText, NOT_RETAINED, readCopyingBarred, routeTrimmed, storeCapture } from "../../../scripts/render-watch.mjs";

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

/** "k of n bytes, p%": the text bytes (newlines not counted) of the given 1-based lines of a text, as the dry run prints them. */
function keptShare(text: string, keep: Array<[number, number]>): string {
  const lines = text.split("\n");
  const all = lines.reduce((n, l) => n + Buffer.byteLength(l), 0);
  const kept = lines.reduce((n, l, i) => n + (keep.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? Buffer.byteLength(l) : 0), 0);
  return `${kept.toLocaleString("en-US")} of ${all.toLocaleString("en-US")} bytes, ${((100 * kept) / all).toFixed(1)}%`;
}

function run(root: string, options: Record<string, unknown> = {}) {
  const lines: string[] = [];
  const code = trimStore({ root, on: "2026-10-06", log: (l: string) => lines.push(l), ...options });
  return { code, out: lines.join("\n") };
}

/**
 * Trim a fixture capture the way the 6.10 pass did, before the wide rule: every cited range kept with its context, wide
 * ones too (amendment 1 (5)(iii)'s stated interim), the block in that pass's shape (no `wide`, no `passes`), a frozen
 * copy's FROZEN.sha256 lines rewritten. What the second pass meets in the repository.
 */
function trimAsOn610(root: string, slug: string) {
  const dir = join(root, "research", "rendered");
  const cites = citationsOf({ root, slugs: [slug], urlsText: readFileSync(join(dir, "urls.txt"), "utf8") }).get(slug) as Array<{ ext: string | null; range: [number, number]; by: string }>;
  const files = diskFiles(slug, dir) as Map<string, Buffer>;
  const metaText = files.get("meta.json")!.toString("utf8");
  const meta = JSON.parse(metaText);
  const block: Record<string, unknown> = { on: "2026-10-06", ruling: RULING, site: "barred.test", copying: "barred", keptLines: [], context: 2, fullSha256: null, fullByteLength: null, lineCount: null, body: null, cited: [], captureCheck: "ok", fullBytesIn: null, history: "fixture: the 6.10 pass" };
  const cited = new Map<string, { file: string; lines: [number, number]; by: string[] }>();
  for (const [ext, bytes] of files) {
    if (ext === "meta.json") continue;
    const n = bytes.toString("utf8").split("\n").length;
    const mine = cites.filter((c) => (c.ext ?? (files.has("txt") ? "txt" : ext)) === ext && c.range[0] <= n);
    for (const c of mine) cited.set(`${ext}:${c.range}`, { file: ext, lines: c.range, by: [...new Set([...(cited.get(`${ext}:${c.range}`)?.by ?? []), c.by])] });
    const kept = keptRanges(mine.map((c) => c.range), n);
    if (ext === "txt") Object.assign(block, { keptLines: kept, fullSha256: sha(bytes), fullByteLength: bytes.length, lineCount: n });
    else block.body = { path: `research/rendered/${slug}.${ext}`, sha256: sha(bytes), byteLength: bytes.length, lineCount: n, keptLines: kept, inTree: kept.length > 0 };
    if (ext === "txt" || kept.length) writeFileSync(join(dir, `${slug}.${ext}`), trimLines(bytes.toString("utf8"), kept));
    else rmSync(join(dir, `${slug}.${ext}`));
  }
  block.cited = [...cited.values()];
  writeFileSync(join(dir, `${slug}.meta.json`), appendTrimmed(metaText, meta, block));
  if (meta.frozen) recordFiles(dir, slug);
  return block;
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
    const { root, dir } = makeStore("dry");
    const before = snapshot(root);
    const { code, out } = run(root);
    const fileText = (f: string) => readFileSync(join(dir, f), "utf8");
    expect(code).toBe(0);
    expect(snapshot(root)).toEqual(before);
    expect(out).toContain("would trim bar-live (barred.test, copying barred; live)");
    expect(out).toContain(`would trim bar-live-2026-10-01 (barred.test, copying barred; frozen, ${MANIFEST} follows)`);
    expect(out).toContain("cited txt:10 by research/notes/n.md:2");
    expect(out).toContain("cited html:5 by research/notes/n.md:2");
    // A bare :20 the scanner gives to "robots.txt" on a line naming the copy is kept anyway.
    expect(out).toContain("cited txt:20 by research/notes/n.md:3 (on its line)");
    expect(out).toContain("cited html:7 by research/notes/n.md:5 (on its line)");
    expect(out).toContain(`txt: keep 8-12, 18-22 (10 of 31 lines; ${keptShare(fileText("bar-live-2026-10-01.txt"), [[8, 12], [18, 22]])})`);
    expect(out).toContain(`html: keep 3-9 (7 of 21 lines; ${keptShare(fileText("bar-live-2026-10-01.html"), [[3, 9]])})`);
    expect(out).toContain("txt: keep no line (0 of 31 lines; 0 of ");
    expect(out).toMatch(/html: removed from the tree \(\d+ bytes, 21 lines; sha256 [0-9a-f]{12} in the meta\)/);
    expect(out).toContain(`json: keep 2-6 (5 of 11 lines; ${keptShare(fileText("bar-json.json"), [[2, 6]])})`);
    // The totals: every trimmed file's text and what of it is kept; each cited range of a capture once.
    const all = ["bar-live-2026-10-01.txt", "bar-live-2026-10-01.html", "bar-live.txt", "bar-json.json"];
    const textBytes = all.reduce((n, f) => n + fileText(f).split("\n").reduce((m, l) => m + Buffer.byteLength(l), 0), 0);
    const keptBytes = [
      ["bar-live-2026-10-01.txt", [[8, 12], [18, 22]]],
      ["bar-live-2026-10-01.html", [[3, 9]]],
      ["bar-json.json", [[2, 6]]],
    ].reduce((n, [f, keep]) => n + fileText(f as string).split("\n").reduce((m, l, i) => m + ((keep as number[][]).some(([a, b]) => i + 1 >= a && i + 1 <= b) ? Buffer.byteLength(l) : 0), 0), 0);
    expect(out).toContain(`text kept in the trimmed files: ${keptBytes.toLocaleString("en-US")} of ${textBytes.toLocaleString("en-US")} bytes, ${((100 * keptBytes) / textBytes).toFixed(1)}%;`);
    expect(out).toContain("; 5 cited range(s) kept;");
    expect(out).not.toContain("wide:");
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

  it("refuses, alone, a trimmed capture cited later at a line its trim emptied (the rest of the run goes on, exit 4), and refuses the run for one whose files no longer match its block", () => {
    const { root, dir } = makeStore("late");
    expect(run(root, { apply: true }).code).toBe(0);
    writeFileSync(join(root, "research/notes/n.md"), `${NOTE}A later line: research/rendered/bar-live-2026-10-01.txt:25\n`);
    // A capture of the barred site that arrived after the first run: trimmed in the same run as the refusal.
    const h = htmlOf(6);
    writeFileSync(join(dir, "bar-new.meta.json"), metaText(baseMeta("bar-new", "https://www.barred.test/new", "html", h)));
    writeFileSync(join(dir, "bar-new.html"), h);
    writeFileSync(join(dir, "bar-new.txt"), textOf(8, "new"));
    const copyBefore = snapshot(join(dir)).filter((l) => l.startsWith("/bar-live-2026-10-01."));
    const late = run(root, { apply: true });
    expect(late.code).toBe(4);
    expect(late.out).toContain(
      "REFUSED bar-live-2026-10-01 (this capture alone; nothing of it is written, the run goes on): bar-live-2026-10-01 is trimmed (2026-10-06) and research/notes/n.md:7 cites txt:25, which the trim emptied (1 such citation(s)): " +
        "freeze the capture from the commit that holds the full bytes (git history) and trim that copy, or cite a kept line",
    );
    expect(late.out).toContain("trimmed bar-new (barred.test, copying barred; live)");
    expect(late.out).toMatch(/1 trimmed \(0 frozen, 1 live\), 2 already trimmed, 1 with nothing in the tree, 1 refused alone;/);
    expect(existsSync(join(dir, "bar-new.html"))).toBe(false);
    expect(snapshot(join(dir)).filter((l) => l.startsWith("/bar-live-2026-10-01."))).toEqual(copyBefore);
    expect(run(root).code).toBe(4);
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

  it("keeps nothing of a cited range longer than WIDE_LINES lines, cited or on its line, not even its ends; keeps a 20-line range whole; a line cited apart inside a wide range keeps its context (amendment 1 (5)(iii))", () => {
    expect(WIDE_LINES).toBe(20);
    expect(isWide([2, 22])).toBe(true);
    expect(isWide([2, 21])).toBe(false);
    const note =
      // "in full (body :2-22)" as indiebook.md:108 has it: the scanner's citation and a bare :N on its line, printed once.
      `${NOTE}Read research/rendered/bar-live-2026-10-01.txt in full (body :2-22), and a quotation (research/rendered/bar-live-2026-10-01.txt:25-27).\n` +
      "Twenty lines (research/rendered/bar-live-2026-10-01.html:2-21).\nThe quotation again (research/rendered/bar-live-2026-10-01.txt:25-27).\n" +
      // A wide range only read on its line (the scanner gives :5-30 to robots.txt).
      "No robots.txt rule (:5-30) of bar-live-2026-10-01.txt reaches it.\n";
    const { root, dir } = makeStore("wide", { note });
    const full = readFileSync(join(dir, "bar-live-2026-10-01.txt"), "utf8");
    const html = readFileSync(join(dir, "bar-live-2026-10-01.html"), "utf8");
    const dry = run(root);
    expect(dry.code).toBe(0);
    for (const r of [dry, run(root, { apply: true })]) {
      expect(r.out).toContain(
        "  wide: txt:2-22 (research/notes/n.md:7) is longer than 20 lines: not a quotation, it keeps nothing (RULING-2026-10-06-robots-and-terms.md amendment 1 (5)(iii)); a line in it that is cited apart keeps that citation's context",
      );
      expect(r.out).toContain("  wide: txt:5-30 (research/notes/n.md:10 on its line) is longer than 20 lines: not a quotation, it keeps nothing");
      expect(r.out.match(/wide:/g)).toHaveLength(2);
      // :10 and :20 inside 2-22 keep 8-12 and 18-22; :25-27 keeps 23-29; the 20-line html:2-21 keeps the html whole.
      expect(r.out).toContain(`txt: keep 8-12, 18-29 (17 of 31 lines; ${keptShare(full, [[8, 12], [18, 29]])})`);
      expect(r.out).toContain(`html: keep 1-21 (21 of 21 lines; ${keptShare(html, [[1, 21]])})`);
      expect(r.out).toContain("cited html:2-21 by research/notes/n.md:8");
      expect(r.out).not.toMatch(/cited txt:(2-22|5-30) /);
      expect(r.out).toContain("2 wide range(s) keeping nothing;");
      // Each cited range of a capture once, however many lines cite it (txt:25-27 twice), and no wide one: 6 of the copy, 1 of bar-json.
      expect(r.out).toContain("; 7 cited range(s) kept;");
    }
    const lines = full.split("\n");
    const after = readFileSync(join(dir, "bar-live-2026-10-01.txt"), "utf8").split("\n");
    expect(after).toHaveLength(lines.length);
    // Not even the ends of a wide range: line 2 (2-22's first) and lines 30-31 (5-30's last, and the end) are empty.
    after.forEach((line, i) => expect(line, `line ${i + 1}`).toBe((i + 1 >= 8 && i + 1 <= 12) || (i + 1 >= 18 && i + 1 <= 29) ? lines[i] : ""));
    expect(readFileSync(join(dir, "bar-live-2026-10-01.html"), "utf8")).toBe(html);
    const t = JSON.parse(readFileSync(join(dir, "bar-live-2026-10-01.meta.json"), "utf8")).trimmed;
    expect(Object.keys(t)).toEqual(BLOCK_KEYS);
    expect(t.keptLines).toEqual([[8, 12], [18, 29]]);
    expect(t.wide).toEqual([
      { file: "txt", lines: [2, 22], by: ["research/notes/n.md:7"] },
      { file: "txt", lines: [5, 30], by: ["research/notes/n.md:10"] },
    ]);
    expect(t.cited.map((c: { file: string; lines: number[] }) => `${c.file}:${c.lines.join("-")}`)).not.toContain("txt:2-22");
    expect(t.cited).toContainEqual({ file: "html", lines: [2, 21], by: ["research/notes/n.md:8"] });
  });

  it("a binary body cited only by a wide range is no refusal: it keeps nothing and leaves the tree", () => {
    const note = `${NOTE}All of the PDF (research/rendered/bar-pdf.pdf:1-40).\n`;
    const { root, dir } = makeStore("widepdf", { note });
    const pdf = Buffer.from(`%PDF-1.4\n${"binary\n".repeat(44)}`);
    writeFileSync(join(dir, "bar-pdf.meta.json"), metaText({ ...baseMeta("bar-pdf", "https://www.barred.test/doc.pdf", "pdf", pdf), textPath: null }));
    writeFileSync(join(dir, "bar-pdf.pdf"), pdf);
    const r = run(root, { apply: true });
    expect(r.code, r.out).toBe(0);
    expect(r.out).toContain("  wide: pdf:1-40 (research/notes/n.md:7) is longer than 20 lines");
    expect(existsSync(join(dir, "bar-pdf.pdf"))).toBe(false);
  });

  it("intersectRanges, keepingRanges and widePass: the second pass takes only what a wide range alone kept, and never brings a line back", () => {
    expect(intersectRanges([[1, 24]], [[8, 12], [18, 22]])).toEqual([[8, 12], [18, 22]]);
    expect(intersectRanges([[1, 5], [10, 20]], [[4, 12]])).toEqual([[4, 5], [10, 12]]);
    expect(intersectRanges([[1, 5]], [])).toEqual([]);
    // Ranges that share one line share that line.
    expect(intersectRanges([[1, 5]], [[5, 9]])).toEqual([[5, 5]]);
    expect(intersectRanges([[3, 3]], [[1, 10]])).toEqual([[3, 3]]);
    expect(keepingRanges([{ range: [2, 22] }, { range: [10, 10] }, { range: [30, 49] }])).toEqual([[10, 10], [30, 49]]);
    const t = { keptLines: [[1, 24]], lineCount: 31, body: null, cited: [{ file: "txt", lines: [2, 22], by: ["n.md:1"] }, { file: "txt", lines: [10, 10], by: ["n.md:2"] }] };
    // The block's record alone: a wide range recorded keeps nothing any more, the line recorded apart stays.
    expect(widePass({ t, cites: [] })).toEqual([{ ext: "txt", before: [[1, 24]], after: [[8, 12]], lines: 31, wide: [{ ext: "txt", range: [2, 22], by: ["n.md:1"], how: "recorded" }] }]);
    // A line cited now inside the old kept lines stays with its context; one outside them adds nothing (no line comes back).
    expect(widePass({ t, cites: [{ ext: "txt", range: [15, 15], by: "n.md:3", how: "cited" }, { ext: "txt", range: [28, 28], by: "n.md:4", how: "cited" }] })[0].after).toEqual([[8, 17]]);
    // No wide range, recorded or cited: nothing to do, however the citations moved since.
    expect(widePass({ t: { ...t, cited: [{ file: "txt", lines: [10, 10], by: ["n.md:2"] }] }, cites: [] })).toEqual([]);
    // A wide range that takes nothing more (its lines kept by others too): nothing to do.
    expect(widePass({ t: { ...t, keptLines: [[8, 12]] }, cites: [] })).toEqual([]);
    // A body kept only by a wide range keeps no line.
    const body = { keptLines: [], lineCount: null, body: { path: "research/rendered/x.html", keptLines: [[1, 30]], lineCount: 30, inTree: true }, cited: [{ file: "html", lines: [2, 28], by: ["n.md:1"] }] };
    expect(widePass({ t: body, cites: [] })).toMatchObject([{ ext: "html", before: [[1, 30]], after: [] }]);
    expect(widePass({ t: { ...body, body: { ...body.body, inTree: false } }, cites: [] })).toEqual([]);
    // A line read on its line beside the old kept lines (emptied, so a note, not a refusal): its context keeps the one
    // old kept line it reaches, and nothing outside them.
    expect(widePass({ t, cites: [{ ext: "txt", range: [26, 26], by: "n.md:5", how: "on its line" }] })[0].after).toEqual([[8, 12], [24, 24]]);
  });

  it("widePass counts a range as the first pass does: one that starts in the file and runs past its end is wide by its own length, or keeps what of it the file has; one that starts past the end counts for nothing", () => {
    // The review's probe: a wide range recorded past the end keeps nothing in the second pass, as it kept nothing in the first.
    const pastEnd = { keptLines: [[27, 298]], lineCount: 298, body: null, cited: [{ file: "txt", lines: [29, 400], by: ["n.md:1"] }] };
    expect(widePass({ t: pastEnd, cites: [] })).toEqual([{ ext: "txt", before: [[27, 298]], after: [], lines: 298, wide: [{ ext: "txt", range: [29, 400], by: ["n.md:1"], how: "recorded" }] }]);
    // The same range cited now (and in no record).
    expect(widePass({ t: { ...pastEnd, cited: [] }, cites: [{ ext: "txt", range: [29, 400], by: "n.md:2", how: "cited" }] })).toMatchObject([{ ext: "txt", after: [] }]);
    // A range that is not wide and runs past the end keeps what of it the file has, recorded or cited now.
    const t = { keptLines: [[1, 24], [27, 31]], lineCount: 31, body: null, cited: [{ file: "txt", lines: [2, 22], by: ["n.md:1"] }, { file: "txt", lines: [10, 10], by: ["n.md:2"] }, { file: "txt", lines: [29, 33], by: ["n.md:3"] }] };
    expect(widePass({ t, cites: [] })[0].after).toEqual([[8, 12], [27, 31]]);
    const cites = [{ ext: "txt", range: [29, 33], by: "n.md:3", how: "cited" }];
    expect(widePass({ t: { ...t, cited: t.cited.slice(0, 2) }, cites })[0].after).toEqual([[8, 12], [27, 31]]);
    // A range that starts past the end is another file's line: wide or not, it neither starts a second pass nor keeps a line.
    const moved = { keptLines: [[8, 12], [20, 24]], lineCount: 31, body: null, cited: [{ file: "txt", lines: [10, 10], by: ["n.md:2"] }] };
    expect(widePass({ t: moved, cites: [{ ext: "txt", range: [35, 60], by: "n.md:4", how: "cited" }] })).toEqual([]);
    expect(widePass({ t: { ...t, cited: t.cited.slice(0, 2) }, cites: [{ ext: "txt", range: [32, 34], by: "n.md:5", how: "cited" }] })[0].after).toEqual([[8, 12]]);
  });

  it("the second pass over ranges that run past the end of the file: the wide one keeps nothing, the one that is not wide keeps what of it the file has, and the block records both, and a range cited since that starts in the file too", () => {
    const at610 = `${NOTE}Read research/rendered/bar-live-2026-10-01.txt in full (body :2-40).\nIts last lines (research/rendered/bar-live-2026-10-01.txt:29-33).\n`;
    const { root, dir } = makeStore("past-end", { note: at610 });
    const copy = "bar-live-2026-10-01";
    const fullTxt = readFileSync(join(dir, `${copy}.txt`), "utf8");
    for (const slug of ["bar-live", copy, "bar-json"]) trimAsOn610(root, slug);
    expect(JSON.parse(readFileSync(join(dir, `${copy}.meta.json`), "utf8")).trimmed.keptLines).toEqual([[1, 31]]);
    // Since 6.10, a further line cites the copy's end again.
    writeFileSync(join(root, "research", "notes", "n.md"), `${at610}The end again (research/rendered/bar-live-2026-10-01.txt:30-34).\n`);
    const dry = run(root, { on: "2026-10-07" });
    expect(dry.code, dry.out).toBe(0);
    expect(dry.out).toContain(`would re-trim ${copy} (wide range txt:2-40;`);
    const applied = run(root, { apply: true, on: "2026-10-07" });
    expect(applied.code, applied.out).toBe(0);
    const lines = fullTxt.split("\n");
    const kept = (n: number) => (n >= 8 && n <= 12) || (n >= 18 && n <= 22) || (n >= 27 && n <= 31);
    readFileSync(join(dir, `${copy}.txt`), "utf8").split("\n").forEach((line, i) => expect(line, `line ${i + 1}`).toBe(kept(i + 1) ? lines[i] : ""));
    const block = JSON.parse(readFileSync(join(dir, `${copy}.meta.json`), "utf8")).trimmed;
    expect(block).toMatchObject({ keptLines: [[8, 12], [18, 22], [27, 31]], fullSha256: sha(fullTxt), lineCount: 31, wide: [{ file: "txt", lines: [2, 40], by: ["research/notes/n.md:7"] }] });
    expect(block.cited).toContainEqual({ file: "txt", lines: [29, 33], by: ["research/notes/n.md:8"] });
    expect(block.cited).toContainEqual({ file: "txt", lines: [30, 34], by: ["research/notes/n.md:9"] });
    expect(checkManifest(dir)).toEqual([]);
    const third = run(root, { apply: true, on: "2026-10-08" });
    expect(third.code, third.out).toBe(3);
  });

  it("the second pass: a capture trimmed on 6.10 whose kept lines a wide range reached is re-trimmed by --apply (lines emptied, keptLines recomputed, the full hashes kept, the pass recorded, FROZEN.sha256 rewritten); a third run has nothing to do", () => {
    const note = `${NOTE}Read research/rendered/bar-live-2026-10-01.txt in full (body :2-22).\nThe whole body (research/rendered/bar-wide.html:2-28).\n`;
    const { root, dir } = makeStore("second", { note });
    // A capture of the barred site whose body only a wide range cites, and no text.
    const wideHtml = htmlOf(30);
    writeFileSync(join(dir, "bar-wide.meta.json"), metaText({ ...baseMeta("bar-wide", "https://www.barred.test/wide", "html", wideHtml), textPath: null }));
    writeFileSync(join(dir, "bar-wide.html"), wideHtml);
    const fullLive = diskFiles("bar-live", dir);
    const copy = "bar-live-2026-10-01";
    const fullTxt = readFileSync(join(dir, `${copy}.txt`), "utf8");
    for (const slug of ["bar-live", copy, "bar-json", "bar-wide"]) trimAsOn610(root, slug);
    expect(JSON.parse(readFileSync(join(dir, `${copy}.meta.json`), "utf8")).trimmed.keptLines).toEqual([[1, 24]]);
    expect(checkManifest(dir)).toEqual([]);
    const metaBefore = readFileSync(join(dir, `${copy}.meta.json`), "utf8");
    const txtBefore = readFileSync(join(dir, `${copy}.txt`), "utf8");
    const textBytes = fullTxt.split("\n").reduce((n, l) => n + Buffer.byteLength(l), 0);

    // The dry run: what it would re-trim, and nothing written.
    const before = snapshot(root);
    const dry = run(root, { on: "2026-10-07" });
    expect(dry.code).toBe(0);
    expect(snapshot(root)).toEqual(before);
    expect(dry.out).toContain(`would re-trim ${copy} (wide range txt:2-22; barred.test, copying barred, trimmed 2026-10-06; frozen, ${MANIFEST} follows)`);
    expect(dry.out).toContain("  wide: txt:2-22 (research/notes/n.md:7) is longer than 20 lines: not a quotation, it keeps nothing");
    expect(dry.out).toContain(
      `  txt: keep 8-12, 18-22 (10 of 31 lines; ${keptShare(fullTxt, [[8, 12], [18, 22]])}); was 1-24 (24 lines; ${keptShare(fullTxt, [[1, 24]])})`,
    );
    expect(dry.out).toContain("would re-trim bar-wide (wide range html:2-28; barred.test, copying barred, trimmed 2026-10-06; live)");
    expect(dry.out).toMatch(/ {2}html: keep no line \(0 of 31 lines; 0 of [\d,]+ bytes, 0\.0%\), so it leaves the tree; was 1-30 \(30 lines; /);
    expect(dry.out).toContain("already trimmed: bar-live (barred.test, 2026-10-06)");
    expect(dry.out).toContain("already trimmed: bar-json (barred.test, 2026-10-06)");
    expect(dry.out).toMatch(/0 would be trimmed \(0 frozen, 0 live\), 2 already trimmed, 1 with nothing in the tree, 0 refused alone; 2 trimmed before the wide rule would be re-trimmed \(amendment 1 \(5\)\(iii\)\), 2 wide range\(s\) keeping nothing;/);
    expect(dry.out).toContain(`${MANIFEST}: 1 frozen copy's lines would be rewritten`);
    expect(dry.out).not.toContain(MARK);

    // --apply.
    const applied = run(root, { apply: true, on: "2026-10-07" });
    expect(applied.code).toBe(0);
    expect(applied.out).toContain(`re-trimmed ${copy} (wide range txt:2-22;`);
    const lines = fullTxt.split("\n");
    const after = readFileSync(join(dir, `${copy}.txt`), "utf8").split("\n");
    expect(after).toHaveLength(lines.length);
    after.forEach((line, i) => expect(line, `line ${i + 1}`).toBe((i + 1 >= 8 && i + 1 <= 12) || (i + 1 >= 18 && i + 1 <= 22) ? lines[i] : ""));
    expect(txtBefore.split("\n").slice(0, 24).every((l, i) => l === lines[i])).toBe(true);
    // The meta: every line above the block as it was, the block rewritten in its order with the pass recorded.
    const metaAfter = readFileSync(join(dir, `${copy}.meta.json`), "utf8");
    const head = metaBefore.slice(0, metaBefore.indexOf('\n  "trimmed": {'));
    expect(metaAfter.startsWith(head)).toBe(true);
    const meta = JSON.parse(metaAfter);
    expect(Object.keys(meta.trimmed)).toEqual([...BLOCK_KEYS, "passes"]);
    expect(meta.trimmed).toMatchObject({
      on: "2026-10-06",
      keptLines: [[8, 12], [18, 22]],
      fullSha256: sha(fullTxt),
      fullByteLength: Buffer.byteLength(fullTxt),
      lineCount: 31,
      body: { keptLines: [[3, 9]], inTree: true },
      wide: [{ file: "txt", lines: [2, 22], by: ["research/notes/n.md:7"] }],
      passes: [{ on: "2026-10-07", ruling: WIDE_RULING, keptLinesBefore: [[1, 24]], bodyKeptLinesBefore: [[3, 9]] }],
    });
    expect(meta.trimmed.cited).toContainEqual({ file: "txt", lines: [10, 10], by: ["research/notes/n.md:2"] });
    expect(meta.trimmed.cited.some((c: { lines: number[] }) => c.lines[0] === 2 && c.lines[1] === 22)).toBe(false);
    expect(fullSha256Of(dir, copy, "txt")).toBe(sha(fullTxt));
    expect(textBytes).toBeGreaterThan(0);
    // FROZEN.sha256 holds the re-trimmed bytes; the frozen-citations guard and --cited's reuse of the copy hold.
    expect(readManifest(dir).get(`${copy}.txt`)).toBe(sha(readFileSync(join(dir, `${copy}.txt`))));
    expect(checkManifest(dir)).toEqual([]);
    expect(existingCopy(dir, "bar-live", fullLive)).toBe(copy);
    // The body a wide range alone kept left the tree.
    expect(existsSync(join(dir, "bar-wide.html"))).toBe(false);
    expect(JSON.parse(readFileSync(join(dir, "bar-wide.meta.json"), "utf8")).trimmed).toMatchObject({
      keptLines: [],
      body: { keptLines: [], inTree: false, sha256: sha(wideHtml) },
      passes: [{ on: "2026-10-07", keptLinesBefore: [], bodyKeptLinesBefore: [[1, 30]] }],
    });
    expect(applied.out).not.toContain(MARK);

    // A third run: nothing to do, nothing written.
    const settled = snapshot(root);
    const third = run(root, { apply: true, on: "2026-10-08" });
    expect(third.code).toBe(3);
    expect(third.out).toContain(`already trimmed: ${copy} (barred.test, 2026-10-06)`);
    expect(third.out).toContain("already trimmed: bar-wide (barred.test, 2026-10-06)");
    expect(snapshot(root)).toEqual(settled);
  });

  it("refuses a re-trim that would blank a line cited apart, or drop a line, even when the trim itself is wrong (the guard holds in the second pass too)", () => {
    const note = `${NOTE}Read research/rendered/bar-live-2026-10-01.txt in full (body :2-22).\n`;
    const { root, dir } = makeStore("reguard", { note });
    const slug = "bar-live-2026-10-01";
    trimAsOn610(root, slug);
    const cites = citationsOf({ root, slugs: [slug], urlsText: readFileSync(join(dir, "urls.txt"), "utf8") }).get(slug);
    const args = { slug, dir, files: diskFiles(slug, dir), cites, site: "barred.test", on: "2026-10-07", commit: null };
    expect(planCapture(args).state).toBe("retrim");
    expect(() => planCapture({ ...args, trimText: (text: string) => trimLines(text, []) })).toThrow(`${slug}.txt: the re-trim would blank txt:10, which research/notes/n.md:2 cites`);
    expect(() => planCapture({ ...args, trimText: (text: string) => text.split("\n").slice(1).join("\n") })).toThrow(`${slug}.txt: the re-trimmed text would not keep its 31 lines`);
  });

  it("replaceTrimmed rewrites only the block, and refuses a meta whose block is not its last key", () => {
    const text = '{\n  "a": 1,\n  "trimmed": {\n    "on": "x"\n  }\n}\n';
    expect(replaceTrimmed(text, { a: 1, trimmed: { on: "x" } }, { on: "x", passes: [1] })).toBe('{\n  "a": 1,\n  "trimmed": {\n    "on": "x",\n    "passes": [\n      1\n    ]\n  }\n}\n');
    expect(() => replaceTrimmed('{\n  "a": 1\n}\n', { a: 1 }, { on: "y" })).toThrow(/cannot be rewritten/);
    const notLast = '{\n  "trimmed": {\n    "on": "x"\n  },\n  "b": 2\n}\n';
    expect(() => replaceTrimmed(notLast, { trimmed: { on: "x" }, b: 2 }, { on: "y" })).toThrow(/cannot be rewritten|cannot take a trimmed block/);
  });

  it("render-watch's route meets the trim: a failed fetch keeps the capture trimmed, and a citation of a line the tree never held is refused alone, with a remedy that can be followed", async () => {
    const { root, dir } = makeStore("route");
    const entry = { url: "https://www.barred.test/route", slug: "bar-route", lineNumber: 1 };
    const page = `<html><body>${Array.from({ length: 6 }, (_, i) => `<p>${MARK} route ${i + 1}</p>`).join("")}</body></html>`;
    const options = { outDir: dir, copying: "barred.test" };
    await storeCapture(entry, { status: 200, contentType: "text/html", bytes: Buffer.from(page), truncated: false, error: null }, { ...options, now: () => "2026-10-13T05:00:00.000Z" });
    await storeCapture(entry, { status: 503, contentType: "text/html", bytes: null, truncated: false, error: "HTTP 503" }, { ...options, now: () => "2026-10-20T05:00:00.000Z" });
    const routed = JSON.parse(readFileSync(join(dir, "bar-route.meta.json"), "utf8"));
    expect(routed).toMatchObject({ status: 503, sha256: null, trimmed: { on: "2026-10-13", fullSha256: sha(`${extractText(page)}\n`), fullBytesIn: NOT_RETAINED, artifact: null } });
    const dry = run(root);
    expect(dry.code).toBe(0);
    expect(dry.out).toContain("already trimmed: bar-route (barred.test, 2026-10-13)");
    expect(dry.out).not.toContain("would trim bar-route");
    // A note cites a line of it: refused alone, the rest of the store trimmed in the same run.
    writeFileSync(join(root, "research/notes/n.md"), `${NOTE}The route page (research/rendered/bar-route.txt:3).\n`);
    const cited = run(root, { apply: true });
    expect(cited.code).toBe(4);
    expect(cited.out).toContain(
      "REFUSED bar-route (this capture alone; nothing of it is written, the run goes on): bar-route is trimmed (2026-10-13) and research/notes/n.md:7 cites txt:3, which the trim emptied (1 such citation(s)): " +
        `its full bytes were never retained (fullBytesIn: "${NOT_RETAINED}"), ` +
        "so no line of it can come back to the tree and no copy of it can be frozen: quote it in the research file without a line of this capture (cite its URL, fetchedAt and sha256, which name the version), or drop the citation",
    );
    expect(cited.out).toMatch(/3 trimmed \(1 frozen, 2 live\), 0 already trimmed, 1 with nothing in the tree, 1 refused alone;/);
    expect(existsSync(join(dir, "bar-live.html"))).toBe(false);
    expect(cited.out).not.toContain(MARK);
    // freeze-capture says the same: there is no full capture to freeze.
    expect(() => planFreeze({ slug: "bar-route", files: diskFiles("bar-route", dir), dir, urlsText: "", on: "2026-10-20" })).toThrow(
      /bar-route is trimmed \(2026-10-13, ruling 6\.10 row 21 \(d\)\).* Its full bytes were never retained \(fullBytesIn: "not retained \(ruling 6\.10 row 21 amendment 1: a public repository's workflow artifacts are not private\)"\): no copy of it can be frozen and no line of it cited; quote it without a line of this capture \(cite its URL, fetchedAt and sha256\)/,
    );
  });

  it("refuses to blank a cited line even when the trim itself is wrong (decision 4(5)): the guard checks every cited line after trimming", () => {
    const { root, dir } = makeStore("guard");
    const urls = readFileSync(join(dir, "urls.txt"), "utf8");
    const slug = "bar-live-2026-10-01";
    const cites = citationsOf({ root, slugs: [slug], urlsText: urls }).get(slug);
    const args = { slug, dir, files: diskFiles(slug, dir), cites, site: "barred.test", on: "2026-10-06", commit: null };
    expect(planCapture(args).state).toBe("trim");
    // A trim that keeps the line count but empties every line (as a wrong keptRanges would): refused, naming the line.
    expect(() => planCapture({ ...args, trimText: (text: string) => trimLines(text, []) })).toThrow(
      `${slug}.txt: the trim would blank txt:10, which research/notes/n.md:2 cites`,
    );
    // One that drops a line instead is refused before that, for the line count.
    expect(() => planCapture({ ...args, trimText: (text: string) => text.split("\n").slice(1).join("\n") })).toThrow(`${slug}.txt: the trimmed text would not keep its 31 lines`);
  });

  it("in a git repository, names the commit that holds the full bytes, and refuses a capture with uncommitted changes", () => {
    const { root, dir } = makeStore("git");
    const git = (...args: string[]) => spawnSync("git", ["-c", "user.name=t", "-c", `user.email=${["t", "example.invalid"].join("@")}`, "-c", "commit.gpgsign=false", ...args], { cwd: root, encoding: "utf8" });
    expect(git("init", "-q").status).toBe(0);
    expect(git("add", "-A").status).toBe(0);
    expect(git("commit", "-q", "-m", "fixture").status).toBe(0);
    const head = git("log", "-1", "--format=%H").stdout.trim();
    expect(head).toMatch(/^[0-9a-f]{40}$/);
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
    expect(() => planFreeze({ slug: "bar-live", files: diskFiles("bar-live", dir), dir, urlsText: "", on: "2026-10-06" })).toThrow(
      /bar-live is trimmed \(2026-10-06, ruling 6\.10 row 21 \(d\)\).* Freeze the full capture \(its full bytes: git history; --from-commit for a commit\)/,
    );
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

  it("render-watch's route writes the same block shape, its full bytes not retained and no artifact (amendment 1)", () => {
    const meta = JSON.parse(readFileSync(join(dir, "bar-live.meta.json"), "utf8"));
    const route = routeTrimmed({ site: "barred.test", on: "2026-10-06", slug: "x", bodyExt: "html", body: Buffer.from("<p>a</p>\n"), text: Buffer.from("a\n") });
    expect(Object.keys(meta.trimmed)).toEqual(BLOCK_KEYS);
    expect(Object.keys(route)).toEqual([...BLOCK_KEYS, "artifact"]);
    expect(route).toMatchObject({ ruling: RULING, wide: [], cited: [], keptLines: [], fullBytesIn: NOT_RETAINED, artifact: null });
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
    const reached = lines.map((l) => /^(?:would trim|trimmed|would re-trim|re-trimmed|already trimmed:|nothing to trim:) (\S+)/.exec(l)?.[1]).filter(Boolean).sort();
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
