import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { buildAiAllowedTable, parseAiAllowedTable } from "../../revenue/ai-allowed-events.js";
// @ts-expect-error — plain ESM script, no type declarations by design (same as prize-dispatch.mjs)
import { PRIZE_TESTS } from "../../../scripts/prize-apply-reading.mjs";

/**
 * scripts/prize-apply-reading.mjs (logs/CHANNEL_LOOP.md §9, queued by tick 49 item 7 and tick 51 item 1) writes a
 * reading workflow's verdicts into research/measurements/ai-allowed-events.md: the verifier's finalClauseCell,
 * finalGrade and finalQualifies into the last three cells of the row whose Event URL cell is the item's URL, every other
 * byte kept. The main thread did it by hand with a Python helper five times in ticks 47-51. What it must never do:
 * write a cell with an unescaped pipe, a newline or an address; cite a capture that is not there; take the reader's
 * grade over the verifier's; write anything when one item is refused; or change a byte outside the three cells.
 *
 * The committed table is only ever read: each case copies it into a temp dir.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "prize-apply-reading.mjs");
const TABLE = join(ROOT, "research", "measurements", "ai-allowed-events.md");
const RENDERED = join(ROOT, "research", "rendered");
// The script imports src/revenue/ai-allowed-events.ts: Node strips the types itself from 22.18; CI's Node 20 needs tsx.
const NODE_ARGS = (process.features as Record<string, unknown>).typescript ? [] : ["--import", "tsx"];
const TMP = mkdtempSync(join(tmpdir(), "prize-apply-reading-"));
afterAll(() => rmSync(TMP, { recursive: true, force: true }));

const committed = readFileSync(TABLE, "utf8");
const committedRows = parseAiAllowedTable(committed);
const urlCount = new Map<string, number>();
for (const r of committedRows) urlCount.set(r.url, (urlCount.get(r.url) ?? 0) + 1);
const unique = committedRows.filter((r) => urlCount.get(r.url) === 1);
const [A, B] = unique;

const CAPTURE = "prize-fixture-aaaa1111";
const P = `research/rendered/${CAPTURE}.txt`;
const CLAUSE = `Silent on AI-built entries: "fixture rule." (${P}:3), running to ${P}:7.`;

let cases = 0;
function fixture({ crlf = false } = {}) {
  const dir = join(TMP, `case-${(cases += 1)}`);
  const rendered = join(dir, "rendered");
  mkdirSync(rendered, { recursive: true });
  writeFileSync(join(dir, "table.md"), crlf ? committed.replace(/\n/g, "\r\n") : committed);
  writeFileSync(join(rendered, `${CAPTURE}.txt`), `${Array.from({ length: 10 }, (_, i) => `line ${i + 1}`).join("\n")}\n`);
  writeFileSync(join(rendered, `${CAPTURE}.meta.json`), `${JSON.stringify({ url: "https://fixture.example/rules", status: 200 })}\n`);
  writeFileSync(join(rendered, "prize-fixture-nometa22.txt"), "one\ntwo\n");
  return { dir, table: join(dir, "table.md"), rendered };
}

type Cells = { grade?: string; qualifies?: string; clause?: string; verdict?: string; readGrade?: string; readQualifies?: string; noVerify?: boolean };
function item(url: string, c: Cells = {}) {
  const grade = c.grade ?? "RENDERED";
  const qualifies = c.qualifies ?? (grade === "RENDERED" ? "no" : "");
  const clause = c.clause ?? CLAUSE;
  return {
    event: { key: "fixture", name: "Fixture event", url: `${url} (fixture.example: CONDITIONAL_MET, a note after the URL)` },
    read: { proposedGrade: c.readGrade ?? grade, proposedQualifies: c.readQualifies ?? qualifies, clauseCell: clause },
    ...(c.noVerify
      ? {}
      : { verify: { gradeVerdict: c.verdict ?? "accept", finalGrade: grade, finalQualifies: qualifies, finalClauseCell: clause, confidence: "high" } }),
  };
}

let outputs = 0;
function output(dir: string, items: unknown[], shape: "result" | "array" = "result") {
  const path = join(dir, `output-${(outputs += 1)}.json`);
  writeFileSync(path, JSON.stringify(shape === "array" ? items : { summary: "fixture", agentCount: 2, result: items }));
  return path;
}

function run(args: string[], env: Record<string, string> = {}) {
  const r = spawnSync(process.execPath, [...NODE_ARGS, SCRIPT, ...args], { cwd: ROOT, encoding: "utf8", env: { ...process.env, ...env } });
  return { code: r.status, out: r.stdout, err: r.stderr, all: `${r.stdout}${r.stderr}` };
}
const apply = (f: ReturnType<typeof fixture>, files: string[], ...more: string[]) =>
  run([...files, "--table", f.table, "--rendered", f.rendered, ...more]);

const rowOf = (text: string, url: string) => parseAiAllowedTable(text).find((r) => r.url === url)!;
/** Indices of the lines that differ between two texts split the same way. */
const changedLines = (before: string, after: string, nl = "\n") => {
  const a = before.split(nl);
  const b = after.split(nl);
  expect(b.length).toBe(a.length);
  return a.flatMap((line, i) => (line === b[i] ? [] : [i]));
};
const lineOf = (text: string, url: string) => text.split("\n").findIndex((l) => l.includes(`| <${url}> |`));

describe("prize-apply-reading: the cells it writes", () => {
  it("has two rows with a URL no other row shares to work on", () => {
    expect(A).toBeDefined();
    expect(B).toBeDefined();
  });

  it("a dry run prints the diff and a summary line, exits 3 and writes nothing; --apply writes RENDERED/no", () => {
    const f = fixture();
    const out = output(f.dir, [item(A.url)]);
    const dry = apply(f, [out]);
    expect(dry.code, dry.all).toBe(3);
    expect(readFileSync(f.table, "utf8")).toBe(committed);
    expect(dry.out).toContain(`--- ${f.table}`);
    expect(dry.out).toMatch(/^@@ -\d+ \+\d+ @@$/m);
    expect(dry.out).toContain(`+| ${A.name} |`);
    expect(dry.out).toContain(`${A.url} → RENDERED/no`);
    expect(dry.out).toMatch(/2 pointers checked \(1 file\)/);

    const done = apply(f, [out], "--apply", "--no-tests");
    expect(done.code, done.all).toBe(0);
    const after = readFileSync(f.table, "utf8");
    const row = rowOf(after, A.url);
    expect([row.clause, row.grade, row.qualifies]).toEqual([CLAUSE, "RENDERED", "no"]);
    expect(changedLines(committed, after)).toEqual([lineOf(committed, A.url)]);
    expect(done.out).toMatch(/row states: graded \d+, awaiting \d+, unsettled \d+/);
  });

  it("keeps the header, every other row and the final newline byte for byte", () => {
    const f = fixture();
    expect(apply(f, [output(f.dir, [item(A.url), item(B.url, { grade: "BLOCKED", clause: `Rules not captured (${P}).` })])], "--apply", "--no-tests").code).toBe(0);
    const after = readFileSync(f.table, "utf8");
    expect(changedLines(committed, after).sort((x, y) => x - y)).toEqual([lineOf(committed, A.url), lineOf(committed, B.url)].sort((x, y) => x - y));
    expect(after.endsWith("\n")).toBe(committed.endsWith("\n"));
    expect(after.split("\n").slice(0, 12)).toEqual(committed.split("\n").slice(0, 12));
  });

  it("writes BLOCKED with an empty qualifies cell, from the {result} shape and from a bare array", () => {
    for (const shape of ["result", "array"] as const) {
      const f = fixture();
      const clause = `Rules not captured: the page is a sign-in form (${P}:2).`;
      expect(apply(f, [output(f.dir, [item(A.url, { grade: "BLOCKED", clause })], shape)], "--apply", "--no-tests").code).toBe(0);
      const row = rowOf(readFileSync(f.table, "utf8"), A.url);
      expect([row.clause, row.grade, row.qualifies]).toEqual([clause, "BLOCKED", ""]);
    }
  });

  it("writes the verifier's cells when it changed the reader's grade (gradeVerdict change is the final word)", () => {
    const f = fixture();
    const it1 = item(A.url, { grade: "BLOCKED", qualifies: "", verdict: "change", readGrade: "RENDERED", readQualifies: "yes" });
    expect(apply(f, [output(f.dir, [it1])], "--apply", "--no-tests").code).toBe(0);
    const row = rowOf(readFileSync(f.table, "utf8"), A.url);
    expect([row.grade, row.qualifies]).toEqual(["BLOCKED", ""]);
  });

  it("collapses runs of spaces and tabs in a cell as the hand helper did, and keeps an escaped pipe", () => {
    const f = fixture();
    const clause = `Rule:\t"a  \\| b"   (${P}:4).`;
    expect(apply(f, [output(f.dir, [item(A.url, { clause })])], "--apply", "--no-tests").code).toBe(0);
    expect(rowOf(readFileSync(f.table, "utf8"), A.url).clause).toBe(`Rule: "a \\| b" (${P}:4).`);
  });

  it("is idempotent: a second --apply of the same output changes nothing and exits 0, and a dry run then exits 0", () => {
    const f = fixture();
    const out = output(f.dir, [item(A.url)]);
    expect(apply(f, [out], "--apply", "--no-tests").code).toBe(0);
    const once = readFileSync(f.table, "utf8");
    const again = apply(f, [out], "--apply", "--no-tests");
    expect(again.code, again.all).toBe(0);
    expect(readFileSync(f.table, "utf8")).toBe(once);
    const dry = apply(f, [out]);
    expect(dry.code, dry.all).toBe(0);
    expect(dry.out).not.toContain("@@");
    expect(dry.out).toMatch(/nothing to change/);
  });

  it("keeps a CRLF table CRLF, final line ending included", () => {
    const f = fixture({ crlf: true });
    const before = readFileSync(f.table, "utf8");
    expect(apply(f, [output(f.dir, [item(A.url)])], "--apply", "--no-tests").code).toBe(0);
    const after = readFileSync(f.table, "utf8");
    expect(after.replace(/\r\n/g, "").includes("\n")).toBe(false);
    expect(after.endsWith("\r\n")).toBe(before.endsWith("\r\n"));
    expect(changedLines(before, after, "\r\n")).toEqual([lineOf(committed, A.url)]);
    expect(rowOf(after, A.url).grade).toBe("RENDERED");
  });

  it("--json writes the per-item summary", () => {
    const f = fixture();
    const json = join(f.dir, "summary.json");
    expect(apply(f, [output(f.dir, [item(A.url, { verdict: "change", readGrade: "BLOCKED" })])], "--json", json).code).toBe(3);
    const s = JSON.parse(readFileSync(json, "utf8"));
    expect(s.applied).toBe(false);
    expect(s.changed).toBe(1);
    expect(s.items).toHaveLength(1);
    expect(s.items[0]).toMatchObject({ key: A.url, grade: "RENDERED", qualifies: "no", gradeVerdict: "change", readerGrade: "BLOCKED", pointers: 2, files: 1, change: true, state: "graded", refused: [] });
  });
});

describe("prize-apply-reading: what it refuses, writing nothing", () => {
  const refused = (f: ReturnType<typeof fixture>, items: unknown[], code = 1) => {
    const r = apply(f, [output(f.dir, items)], "--apply", "--no-tests");
    expect(r.code, r.all).toBe(code);
    expect(readFileSync(f.table, "utf8")).toBe(committed);
    expect(r.err).toMatch(/nothing written/);
    return r;
  };

  it("a key that matches no row: exit 2, naming the key and the count", () => {
    const f = fixture();
    const missing = "https://no-such-event.example/rules?ref=x";
    const r = refused(f, [item(A.url), item(missing)], 2);
    expect(r.err).toContain(missing);
    expect(r.err).toMatch(/matches 0 rows/);
  });

  it("a key that is a prefix of a row's URL is not that row (exact match, not a substring)", () => {
    const f = fixture();
    const r = refused(f, [item(A.url.slice(0, -2))], 2);
    expect(r.err).toMatch(/matches 0 rows/);
  });

  it("a key that matches two rows: exit 2", () => {
    const f = fixture();
    const lines = committed.split("\n");
    const at = lineOf(committed, A.url);
    writeFileSync(f.table, [...lines.slice(0, at + 1), lines[at], ...lines.slice(at + 1)].join("\n"));
    const before = readFileSync(f.table, "utf8");
    const r = apply(f, [output(f.dir, [item(A.url)])], "--apply", "--no-tests");
    expect(r.code, r.all).toBe(2);
    expect(r.err).toMatch(/matches 2 rows/);
    expect(readFileSync(f.table, "utf8")).toBe(before);
  });

  it("two items for one key, in one output or across two", () => {
    const f = fixture();
    expect(refused(f, [item(A.url), item(A.url, { grade: "BLOCKED" })]).err).toMatch(/2 items for this key/);
    const r = apply(f, [output(f.dir, [item(A.url)]), output(f.dir, [item(A.url)])], "--apply", "--no-tests");
    expect(r.code, r.all).toBe(1);
    expect(readFileSync(f.table, "utf8")).toBe(committed);
  });

  it("an item with no verify block, even when the reader proposed cells", () => {
    const f = fixture();
    expect(refused(f, [item(A.url, { noVerify: true })]).err).toMatch(/no verify block/);
  });

  it("a grade outside RENDERED, BLOCKED, NONE, SNIPPET", () => {
    const f = fixture();
    expect(refused(f, [item(A.url, { grade: "rendered" })]).err).toMatch(/finalGrade/);
    expect(refused(f, [item(A.url, { grade: "SAME EVENT", qualifies: "" })]).err).toMatch(/finalGrade/);
  });

  it("a qualifies cell outside yes, no and empty, or not empty under a grade other than RENDERED", () => {
    const f = fixture();
    expect(refused(f, [item(A.url, { qualifies: "maybe" })]).err).toMatch(/finalQualifies/);
    expect(refused(f, [item(A.url, { grade: "BLOCKED", qualifies: "no" })]).err).toMatch(/empty unless the grade is RENDERED/);
    expect(refused(f, [item(A.url, { grade: "SNIPPET", qualifies: "yes" })]).err).toMatch(/empty unless the grade is RENDERED/);
  });

  it("a clause with an unescaped pipe, or a newline", () => {
    const f = fixture();
    expect(refused(f, [item(A.url, { clause: `a | b (${P}:1)` })]).err).toMatch(/unescaped "\|"/);
    expect(refused(f, [item(A.url, { clause: `a\nb (${P}:1)` })]).err).toMatch(/newline/);
    expect(refused(f, [item(A.url, { clause: `a\r\nb (${P}:1)` })]).err).toMatch(/newline/);
  });

  it("a clause with an address in any form, naming the kind and never the address", () => {
    const f = fixture();
    const local = ["fixture", "person"].join(".");
    const domain = ["uni", "example"].join(".");
    const forms: [string, RegExp][] = [
      [[local, domain].join("@"), /an @ between word characters/],
      [[local, domain].join("%" + "40"), /a percent-encoded @/],
      [["[redacted:email]", domain].join("@"), /a masked address/],
      ["[redacted:email]", /a masked address/],
      [[local, domain].join("\\" + "x40"), /script-escaped/],
      [[local, domain].join("&#" + "64;"), /character reference/],
    ];
    for (const [address, kind] of forms) {
      const r = refused(f, [item(A.url, { clause: `Write to ${address} for the rules (${P}:1).` })]);
      expect(r.err).toMatch(kind);
      expect(r.all).not.toContain(address);
      expect(r.all).not.toContain(local);
    }
  });

  it("a pointer to a missing file, to a file with no meta, past the last line or to line 0, or to a non-capture", () => {
    const f = fixture();
    const cases: [string, RegExp][] = [
      ["research/rendered/prize-fixture-missing0.txt:1", /no such file/],
      ["research/rendered/prize-fixture-nometa22.txt:1", /no prize-fixture-nometa22\.meta\.json/],
      [`${P}:11`, /line 11 is past the end \(10 lines\)/],
      [`${P}:0`, /line 0/],
      [`${P}:3-12`, /line 12 is past the end/],
      ["research/rendered/urls.txt", /not a capture/],
      [`research/rendered/${CAPTURE}.meta.json`, /not a capture/],
    ];
    for (const [pointer, why] of cases) {
      const r = refused(f, [item(A.url, { clause: `Silent (${pointer}).` })]);
      expect(r.err, pointer).toMatch(why);
    }
    // The last line itself is inside the file; a pointer without a line names only the file.
    expect(apply(f, [output(f.dir, [item(A.url, { clause: `Silent (${P}:10; ${P}).` })])]).code).toBe(3);
  });

  it("one refused item refuses the whole run: the good item next to it is not written either", () => {
    const f = fixture();
    const r = refused(f, [item(A.url), item(B.url, { clause: "a | b" })]);
    expect(r.err).toContain(B.url);
  });

  it("an output that is neither an array nor {result: [...]}, or not JSON", () => {
    const f = fixture();
    const bad = join(f.dir, "bad.json");
    writeFileSync(bad, JSON.stringify({ result: "no" }));
    expect(apply(f, [bad], "--apply", "--no-tests").code).toBe(1);
    writeFileSync(bad, "{ not json");
    expect(apply(f, [bad], "--apply", "--no-tests").code).toBe(1);
    expect(readFileSync(f.table, "utf8")).toBe(committed);
    expect(run([]).code).toBe(1);
  });
});

describe("prize-apply-reading: --apply runs the prize tests", () => {
  it("names the five prize test files, every prize-* test file of the suite but this one", () => {
    const dir = join(ROOT, "src", "__tests__", "revenue");
    const prize = readdirSync(dir).filter((n) => /^prize-.*\.test\.ts$/.test(n) && n !== basename(fileURLToPath(import.meta.url)));
    expect(PRIZE_TESTS).toHaveLength(5);
    expect([...PRIZE_TESTS].map((p: string) => basename(p)).sort()).toEqual(prize.sort());
    for (const p of PRIZE_TESTS) expect(existsSync(join(ROOT, p))).toBe(true);
  });

  it("runs the test command after writing and exits with its code; --no-tests skips it", () => {
    const f = fixture();
    const out = output(f.dir, [item(A.url)]);
    const marker = join(f.dir, "tests-ran");
    const cmd = (code: number) => `${process.execPath} -e require("fs").writeFileSync(process.argv[1],"x");process.exit(${code}) ${marker}`;
    const r5 = run([out, "--table", f.table, "--rendered", f.rendered, "--apply"], { PRIZE_APPLY_TEST_CMD: cmd(5) });
    expect(r5.code, r5.all).toBe(5);
    expect(existsSync(marker)).toBe(true);
    expect(rowOf(readFileSync(f.table, "utf8"), A.url).grade).toBe("RENDERED");
    expect(r5.out).toMatch(/^prize tests: exited 5$/m);

    rmSync(marker, { force: true });
    const r0 = run([out, "--table", f.table, "--rendered", f.rendered, "--apply"], { PRIZE_APPLY_TEST_CMD: cmd(0) });
    expect(r0.code, r0.all).toBe(0);
    expect(existsSync(marker)).toBe(true);

    rmSync(marker, { force: true });
    expect(run([out, "--table", f.table, "--rendered", f.rendered, "--apply", "--no-tests"], { PRIZE_APPLY_TEST_CMD: cmd(5) }).code).toBe(0);
    expect(existsSync(marker)).toBe(false);
    // A dry run never runs them.
    expect(run([out, "--table", f.table, "--rendered", f.rendered], { PRIZE_APPLY_TEST_CMD: cmd(5) }).code).toBe(0);
    expect(existsSync(marker)).toBe(false);
  });
});

/**
 * The hand helper's rule reproduced: the cells a session already wrote, fed back in the shape a reading workflow writes
 * them (an output file with summary, logs and result; the URL with a note after it), change nothing in the table. The
 * real outputs of ticks 47 and 49 are not committed (they hold capture text); this builds the same shape from the
 * committed table, with the real research/rendered for the pointers.
 */
describe("prize-apply-reading: the committed table's own cells change nothing", () => {
  it("every row a session wrote, with a URL no other row shares, comes back byte for byte (exit 0, no diff)", () => {
    const f = fixture();
    const written = unique.filter((r) => r.clause !== "" || r.grade !== "" || r.qualifies !== "");
    expect(written.length).toBeGreaterThan(0);
    const items = written.map((r) => ({
      event: { key: "from-table", name: r.name, url: `${r.url} (a note the workflow adds)` },
      read: { proposedGrade: r.grade, proposedQualifies: r.qualifies, clauseCell: r.clause },
      verify: { gradeVerdict: "accept", finalGrade: r.grade, finalQualifies: r.qualifies, finalClauseCell: r.clause, confidence: "high" },
    }));
    const r = run([output(f.dir, items), "--table", f.table, "--rendered", RENDERED]);
    expect(r.code, r.all).toBe(0);
    expect(r.out).not.toContain("@@");
    expect(r.out.match(/ → /g)?.length).toBe(written.length);
  });

  /**
   * The real reading outputs, when a session has them: PRIZE_APPLY_REAL_OUTPUTS lists output files (path-delimiter
   * separated) whose cells the table already holds. Not set in CI: the files are not in the repository.
   */
  it.runIf(Boolean(process.env.PRIZE_APPLY_REAL_OUTPUTS))("the real outputs named in PRIZE_APPLY_REAL_OUTPUTS change nothing", () => {
    const f = fixture();
    const files = String(process.env.PRIZE_APPLY_REAL_OUTPUTS).split(delimiter).filter(Boolean);
    const r = run([...files, "--table", f.table, "--rendered", RENDERED]);
    expect(r.code, r.all).toBe(0);
    expect(r.out).not.toContain("@@");
  });
});

describe("the instrument's text names the script as the way a reading's cells are applied", () => {
  it("step 3 of the template and of the committed md name `node scripts/prize-apply-reading.mjs <output.json> --apply`", () => {
    const built = buildAiAllowedTable({
      events: [],
      measuredAt: "2026-10-05T00:00:00Z",
      measuredOn: "2026-10-05",
      source: "https://example.org/competitions.json",
      sourceSha256: "0".repeat(64),
      existingMarkdown: null,
      captureExists: () => true,
    });
    for (const text of [built.markdown, committed]) {
      const step3 = text.split(/\r?\n/).find((l) => l.startsWith("3. "));
      expect(step3).toContain("`node scripts/prize-apply-reading.mjs <output.json> --apply`");
    }
  });
});
