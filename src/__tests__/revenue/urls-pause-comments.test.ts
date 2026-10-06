import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design (same as queue-zero-test.mjs)
import { applyVerdicts } from "../../../scripts/queue-zero-test.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { termsBarred } from "../../../scripts/render-watch.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design (same as queue-zero-test.mjs)
import { KEEP_AS_IS, assertOnlyCommentsChanged, reasonFor, syncPauseComments, todayNote } from "../../../scripts/urls-pause-comments.mjs";

/**
 * scripts/urls-pause-comments.mjs — urls.txt's "# paused (terms unread ...)" comments name the site's verdict of the
 * day they were written; when terms-verdicts.json changes, the script rewrites the verdict word and the date note
 * (logs/CHANNEL_LOOP.md §9, tick 36, item 7), and the reason when it is one the verdict decides ("terms unread",
 * "terms read", "terms read, left paused"; tick 39 review, defect 1). A TERMS_BARRED host's comment takes the
 * "terms audit ... see TERMS_BARRED" form queue-zero-test --apply-verdicts writes for it. A reason a person wrote is
 * kept (defect 3). It never changes a URL, slug or js flag (checked by assertOnlyCommentsChanged before anything is
 * written; defect 2), never un-pauses a line, never touches an active or retired line, and leaves nevo.co.il's pinned
 * comments as they are.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "urls-pause-comments.mjs");
const V = "research/channel-loop/terms-verdicts.json";

const SITES = {
  "pending.example": { verdict: "NO_TERMS", source: "no terms (round 3)", checked: "2026-09-29" },
  "same.example": { verdict: "TERMS_PENDING", source: "https://same.example/terms", checked: "2026-09-29" },
  "read.example": { verdict: "NOT_BARRED", source: "terms read", checked: "2026-09-29", note: "lines stay paused (no weekly need)" },
  "barred.example": { verdict: "BARRED", source: "terms bar robots", checked: "2026-09-29" },
  // A real TERMS_BARRED domain (scripts/render-watch.mjs), so the terms-audit form is the real one.
  "tipalti.com": { verdict: "BARRED", source: "TERMS_BARRED in scripts/render-watch.mjs", checked: "2026-09-29" },
  // CONDITIONAL_UNMET does not say whether the terms were read (n8n.io's is "linked but unread"; y8.com's was read).
  "unmet.example": { verdict: "CONDITIONAL_UNMET", source: "its policy is linked but unread", checked: "2026-09-29" },
  "nevo.co.il": {
    verdict: "NO_TERMS_ROBOTS_OK",
    source: "scripts/robots-verdict.mjs",
    checked: "2026-10-06",
    note: "exhaustive-negative (osek-patur-documents.md:1129-1141)",
  },
};

const URLS = [
  "# a list",
  /* 2 */ `# paused (terms unread, 29.9.2026): pending.example is TERMS_PENDING in ${V} — https://pending.example/a\tpending-a`,
  /* 3 */ `# paused (terms unread, 29.9.2026): same.example is TERMS_PENDING in ${V} — https://same.example/b\tsame-b`,
  /* 4 */ `# paused (terms unread, 29.9.2026; verdict as of 1.10.2026): read.example is NO_TERMS in ${V} — https://read.example/c\tread-c\tjs`,
  /* 5 */ `# paused (terms unread): barred.example is TERMS_PENDING in ${V} — https://barred.example/d?x=1&y=2\tbarred-d`,
  /* 6 */ `# paused (terms unread, 29.9.2026): gone.example is NO_TERMS in ${V} — https://gone.example/e\tgone-e`,
  /* 7 */ `# paused (NO_TERMS, exhaustive-negative; waits on robots.txt support, ruling 30.9 16(d) D2(v)): nevo.co.il in ${V} — https://www.nevo.co.il/law_html/law00/1.htm\tnevo-one`,
  /* 8 */ `# paused (terms unread, 29.9.2026): nevo.co.il is NO_TERMS in ${V} — https://www.nevo.co.il/law_html/law01/2.htm\tnevo-two`,
  /* 9 */ `# retired (tick 36: 404): pending.example is TERMS_PENDING in ${V} — https://pending.example/old\tpending-old`,
  /* 10 */ `#paused (terms unread, 29.9.2026): pending.example is TERMS_PENDING in ${V} — https://pending.example/f\tpending-f`,
  /* 11 */ "https://read.example/active\tread-active",
  /* 12 */ `# paused (tick 33: an empty shell; read.example is NO_TERMS in ${V}) — https://read.example/g\tread-g`,
  /* 13 */ `# paused (terms unread, 29.9.2026): tipalti.com is TERMS_PENDING in ${V} — https://help.tipalti.com/hc/a\ttipalti-a`,
  // 14-15: what the first --fix left in the committed file: the verdict is current, the reason is not.
  /* 14 */ `# paused (terms unread, 29.9.2026; verdict as of 4.10.2026): tipalti.com is BARRED in ${V} — https://help.tipalti.com/hc/b\ttipalti-b`,
  /* 15 */ `# paused (terms unread; verdict as of 1.10.2026): read.example is NOT_BARRED in ${V} — https://read.example/h\tread-h`,
  // 16-19: reasons the verdict does not decide; kept as written.
  /* 16 */ `# paused (tick 21, 29.9.2026): read.example is TERMS_PENDING in ${V} — https://read.example/i\tread-i`,
  /* 17 */ `# paused (terms unread round 2, 29.9.2026): unmet.example is TERMS_PENDING in ${V} — https://unmet.example/j\tunmet-j`,
  /* 18 */ `# paused (terms unread, 29.9.2026): unmet.example is TERMS_PENDING in ${V} — https://unmet.example/k\tunmet-k`,
  /* 19 */ `# paused (tick 21, 29.9.2026): tipalti.com is TERMS_PENDING in ${V} — https://help.tipalti.com/hc/c\ttipalti-c`,
  "",
].join("\n");
const AUDIT = "see TERMS_BARRED in scripts/render-watch.mjs";

const sync = (urls = URLS, sites: Record<string, unknown> = SITES, today = "4.10.2026") => syncPauseComments(urls, sites, { today });
const lineOf = (text: string, n: number) => text.split("\n")[n - 1];
const tail = (line: string) => line.slice(line.lastIndexOf(" — "));

describe("syncPauseComments — the verdict word and the date note, nothing else", () => {
  it("rewrites a stale comment's verdict and date note, and keeps the URL, slug and js flag byte for byte", () => {
    const out = sync();
    expect(lineOf(out.text, 2)).toBe(
      `# paused (terms unread, 29.9.2026; verdict as of 4.10.2026): pending.example is NO_TERMS in ${V} — https://pending.example/a\tpending-a`,
    );
    // An earlier "verdict as of" note is replaced, not stacked; the js flag stays. NOT_BARRED came from reading the
    // terms, so "terms unread" goes; the gate passes, and the line is left paused for the main thread.
    expect(lineOf(out.text, 4)).toBe(
      `# paused (terms read, left paused, 29.9.2026; verdict as of 4.10.2026): read.example is NOT_BARRED in ${V} — https://read.example/c\tread-c\tjs`,
    );
    // A comment without a pause date (as queue-zero-test --apply-verdicts writes it) gets the note and no invented date.
    // barred.example is BARRED in the verdict file but not in TERMS_BARRED: the verdict form stays, the reason is "terms read".
    expect(lineOf(out.text, 5)).toBe(
      `# paused (terms read; verdict as of 4.10.2026): barred.example is BARRED in ${V} — https://barred.example/d?x=1&y=2\tbarred-d`,
    );
    expect(out.changes.map((c: { line: number; from: string; to: string }) => [c.line, c.from, c.to])).toEqual([
      [2, "TERMS_PENDING", "NO_TERMS"],
      [4, "NO_TERMS", "NOT_BARRED"],
      [5, "TERMS_PENDING", "BARRED"],
      [13, "TERMS_PENDING", "BARRED"],
      [14, "BARRED", "BARRED"],
      [15, "NOT_BARRED", "NOT_BARRED"],
      [16, "TERMS_PENDING", "NOT_BARRED"],
      [17, "TERMS_PENDING", "CONDITIONAL_UNMET"],
      [18, "TERMS_PENDING", "CONDITIONAL_UNMET"],
      [19, "TERMS_PENDING", "BARRED"],
    ]);
  });

  it("writes a TERMS_BARRED host's comment in the terms-audit form --apply-verdicts writes, keeping the pause date", () => {
    expect(termsBarred("help.tipalti.com")?.domain).toBe("tipalti.com");
    const out = sync();
    expect(lineOf(out.text, 13)).toBe(`# paused (terms audit, 29.9.2026): tipalti.com — ${AUDIT} — https://help.tipalti.com/hc/a\ttipalti-a`);
    // The same form applyVerdicts gives the active line, with the pause date added.
    const applied = applyVerdicts("https://help.tipalti.com/hc/a\ttipalti-a", SITES).urls;
    expect(lineOf(out.text, 13)).toBe(applied.replace("# paused (terms audit): ", "# paused (terms audit, 29.9.2026): "));
    // A comment whose verdict word is already BARRED is rewritten too: its reason was the stale part.
    expect(lineOf(out.text, 14)).toBe(`# paused (terms audit, 29.9.2026): tipalti.com — ${AUDIT} — https://help.tipalti.com/hc/b\ttipalti-b`);
  });

  it("replaces only a reason the verdict decides; a reason a person wrote, or one the verdict cannot judge, is kept", () => {
    const out = sync();
    // The verdict is current and only the reason was wrong (ypay's lines after the first --fix): the reason is rewritten.
    expect(lineOf(out.text, 15)).toBe(
      `# paused (terms read, left paused; verdict as of 4.10.2026): read.example is NOT_BARRED in ${V} — https://read.example/h\tread-h`,
    );
    // A person's reason stays, on an ordinary site and on a TERMS_BARRED one; only the verdict word and the note change.
    expect(lineOf(out.text, 16)).toBe(
      `# paused (tick 21, 29.9.2026; verdict as of 4.10.2026): read.example is NOT_BARRED in ${V} — https://read.example/i\tread-i`,
    );
    expect(lineOf(out.text, 17)).toBe(
      `# paused (terms unread round 2, 29.9.2026; verdict as of 4.10.2026): unmet.example is CONDITIONAL_UNMET in ${V} — https://unmet.example/j\tunmet-j`,
    );
    expect(lineOf(out.text, 19)).toBe(
      `# paused (tick 21, 29.9.2026; verdict as of 4.10.2026): tipalti.com is BARRED in ${V} — https://help.tipalti.com/hc/c\ttipalti-c`,
    );
    // CONDITIONAL_UNMET does not say whether the terms were read, so "terms unread" is left as written.
    expect(lineOf(out.text, 18)).toBe(
      `# paused (terms unread, 29.9.2026; verdict as of 4.10.2026): unmet.example is CONDITIONAL_UNMET in ${V} — https://unmet.example/k\tunmet-k`,
    );
    expect(
      ["TERMS_PENDING", "NO_TERMS", "BARRED", "NOT_BARRED", "CONDITIONAL_MET", "CONDITIONAL_UNMET", "NO_TERMS_ROBOTS_OK"].map(reasonFor),
    ).toEqual(["terms unread", "terms unread", "terms read", "terms read, left paused", "terms read, left paused", null, null]);
  });

  it("never changes a URL or slug, never un-pauses, and leaves every other line byte-identical", () => {
    const out = sync();
    const before = URLS.split("\n");
    const after = out.text.split("\n");
    expect(after).toHaveLength(before.length);
    const changed = new Set(out.changes.map((c: { line: number }) => c.line));
    before.forEach((line, i) => {
      if (!changed.has(i + 1)) expect(after[i], `line ${i + 1}`).toBe(line);
      else {
        expect(tail(after[i]), `line ${i + 1}`).toBe(tail(line));
        expect(after[i].startsWith("# paused (")).toBe(true);
      }
    });
    // The active line and the retired line are untouched, and so is a current comment (line 3).
    expect(lineOf(out.text, 11)).toBe("https://read.example/active\tread-active");
    expect(lineOf(out.text, 9)).toBe(before[8]);
    expect(lineOf(out.text, 3)).toBe(before[2]);
  });

  it("leaves nevo.co.il's pause comments exactly as they are, even when nevo's verdict has changed", () => {
    expect(KEEP_AS_IS.has("nevo.co.il")).toBe(true);
    const out = sync();
    expect(lineOf(out.text, 7)).toBe(URLS.split("\n")[6]);
    expect(lineOf(out.text, 8)).toBe(URLS.split("\n")[7]);
    expect(out.kept).toEqual([{ line: 8, site: "nevo.co.il" }]);
    expect(out.unpause.some((u: { site: string }) => u.site === "nevo.co.il")).toBe(false);
  });

  it("does not touch a comment for a site with no verdict, and reports it", () => {
    const out = sync();
    expect(lineOf(out.text, 6)).toBe(URLS.split("\n")[5]);
    expect(out.unresolved).toEqual([{ line: 6, site: "gone.example", named: "NO_TERMS" }]);
  });

  it("lists a terms-paused line that would pass the terms gate now, and leaves it paused", () => {
    const out = sync();
    expect(out.unpause).toEqual([
      { line: 4, site: "read.example", verdict: "NOT_BARRED", slug: "read-c", url: "https://read.example/c" },
      { line: 15, site: "read.example", verdict: "NOT_BARRED", slug: "read-h", url: "https://read.example/h" },
    ]);
    expect(lineOf(out.text, 4).startsWith("# paused")).toBe(true);
    // A line paused for another reason (line 12, a js shell) is not a terms pause and is not listed.
    expect(out.unpause.some((u: { line: number }) => u.line === 12)).toBe(false);
  });

  it("reads a paused line's js flag: a K4 shell site's js terms line would pass the gate, its plain one would not", () => {
    // Ruling 6.10 row 21 (c) 3(2): termsGate passes a NO_TERMS shell site's terms page only as a js line.
    const sites = { "shell.example": { verdict: "NO_TERMS", source: "test", checked: "2026-10-06", note: "shell: a React shell" } };
    const urls = [
      `# paused (terms unread, 6.10.2026): shell.example is NO_TERMS in ${V} — https://shell.example/legal\tterms-shell\tjs`,
      `# paused (terms unread, 6.10.2026): shell.example is NO_TERMS in ${V} — https://shell.example/terms\tterms-shell-2`,
      "",
    ].join("\n");
    expect(sync(urls, sites, "6.10.2026").unpause).toEqual([
      { line: 1, site: "shell.example", verdict: "NO_TERMS", slug: "terms-shell", url: "https://shell.example/legal" },
    ]);
  });

  it("is idempotent: a second pass over its own output changes nothing", () => {
    const once = sync();
    const twice = sync(once.text, SITES, "5.10.2026");
    expect(twice.changes).toEqual([]);
    expect(twice.text).toBe(once.text);
  });

  it("refuses a malformed --today rather than write a bad note", () => {
    expect(() => sync(URLS, SITES, "2026-10-04")).toThrow(/D\.M\.YYYY/);
    expect(todayNote(new Date("2026-10-04T23:30:00Z"))).toBe("4.10.2026");
  });
});

describe("assertOnlyCommentsChanged — the check syncPauseComments runs before anything is written", () => {
  const out = sync();
  const changed = out.changes.map((c: { line: number }) => c.line);
  const edit = (n: number, f: (l: string) => string) => {
    const lines = out.text.split("\n");
    lines[n - 1] = f(lines[n - 1]);
    return lines.join("\n");
  };
  const check = (after: string) => () => assertOnlyCommentsChanged(URLS, after, changed);

  it("passes the script's own output", () => {
    expect(check(out.text)).not.toThrow();
  });

  it("throws when a changed line's URL, slug or js flag differs, read the way robots-verdict.mjs reads them", () => {
    expect(check(edit(2, (l) => l.replace("https://pending.example/a", "https://pending.example/z")))).toThrow(/line 2:/);
    expect(check(edit(13, (l) => l.replace("\ttipalti-a", "\ttipalti-z")))).toThrow(/line 13:/);
    expect(check(edit(4, (l) => l.replace(/\tjs$/, "")))).toThrow(/line 4:/);
  });

  it("throws when a changed line is no longer paused, a line not listed as changed differs, or a line is added", () => {
    expect(check(edit(2, (l) => l.slice(l.lastIndexOf(" — ") + 3)))).toThrow(/line 2:/);
    expect(check(edit(3, (l) => `${l} `))).toThrow(/line 3:/);
    expect(check(`${out.text}\nhttps://extra.example/x\textra-x`)).toThrow(/lines/);
  });
});

const dirs: string[] = [];
afterAll(() => {
  for (const d of dirs) rmSync(d, { recursive: true, force: true });
});

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "urls-pause-comments-test-"));
  dirs.push(dir);
  const urls = join(dir, "urls.txt");
  const verdicts = join(dir, "terms-verdicts.json");
  // No unresolved site in the CLI fixture, so the exit code speaks only of stale comments.
  writeFileSync(urls, URLS.split("\n").filter((l) => !l.includes("gone.example")).join("\n"));
  writeFileSync(verdicts, JSON.stringify({ _about: "test", sites: SITES }));
  const run = (...args: string[]) =>
    spawnSync(process.execPath, [SCRIPT, "--urls", urls, "--verdicts", verdicts, "--today", "4.10.2026", ...args], { encoding: "utf8" });
  return { urls, run };
}

describe("urls-pause-comments CLI", () => {
  it("--check lists the stale comments, exits 1 and writes nothing; --fix writes; then --check exits 0", () => {
    const f = fixture();
    const original = readFileSync(f.urls, "utf8");
    const check = f.run("--check");
    expect(check.status).toBe(1);
    expect(check.stdout).toContain("pending.example: TERMS_PENDING -> NO_TERMS");
    expect(check.stdout).toContain("tipalti.com: BARRED -> BARRED (the reason changed)");
    expect(check.stdout).toContain("left paused");
    expect(readFileSync(f.urls, "utf8")).toBe(original);

    const fix = f.run("--fix");
    expect(fix.status).toBe(0);
    expect(fix.stdout).toContain("10 comment(s) rewritten");
    const fixed = readFileSync(f.urls, "utf8");
    expect(fixed).not.toBe(original);
    expect(fixed.split("\n").map(tail)).toEqual(original.split("\n").map(tail));

    expect(f.run("--check").status).toBe(0);
  });

  it("exits 1 on a comment naming a site with no verdict, in either mode, and leaves it", () => {
    const f = fixture();
    writeFileSync(f.urls, `${readFileSync(f.urls, "utf8")}${URLS.split("\n")[5]}\n`);
    const fix = f.run("--fix");
    expect(fix.status).toBe(1);
    expect(fix.stdout).toContain("gone.example has no verdict");
    expect(readFileSync(f.urls, "utf8")).toContain(URLS.split("\n")[5]);
  });

  it("exits 2 on usage: no mode, both modes, an unknown flag, a bad --today", () => {
    const f = fixture();
    expect(f.run().status).toBe(2);
    expect(f.run("--check", "--fix").status).toBe(2);
    expect(f.run("--check", "--force").status).toBe(2);
    expect(f.run("--check", "--today", "4/10/2026").status).toBe(2);
  });
});

describe("the committed urls.txt", () => {
  it("names each paused site's current verdict (run `node scripts/urls-pause-comments.mjs --fix` after a verdict changes)", () => {
    const urls = readFileSync(join(ROOT, "research", "rendered", "urls.txt"), "utf8");
    const sites = JSON.parse(readFileSync(join(ROOT, V), "utf8")).sites;
    const out = syncPauseComments(urls, sites, { today: "4.10.2026" });
    expect(out.changes.map((c: { line: number; site: string }) => `${c.line} ${c.site}`)).toEqual([]);
    expect(out.unresolved).toEqual([]);
  });

  it("keeps nevo's eight pause comments in their pinned form", () => {
    const urls = readFileSync(join(ROOT, "research", "rendered", "urls.txt"), "utf8");
    const nevo = urls.split("\n").filter((l) => l.startsWith("# paused") && l.includes("nevo.co.il/law_html/"));
    expect(nevo).toHaveLength(8);
    for (const l of nevo) {
      expect(l).toMatch(/^# paused \(NO_TERMS, exhaustive-negative; waits on robots\.txt support, ruling 30\.9 16\(d\) D2\(v\)\): nevo\.co\.il in /);
    }
  });
});
