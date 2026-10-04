import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design
import { CAPTURE_EXTS as FREEZE_EXTS } from "../../../scripts/freeze-capture.mjs";
import {
  CAPTURE_EXTS,
  COMMANDS,
  STATUS_CELLS,
  cells,
  checkEdit,
  insertAfter,
  joinLines,
  parseCommand,
  parseLines,
  protectedTokens,
  replaceInLine,
  repointCapture,
  runCommand,
  separators,
  setCell,
  setStatus,
  tables,
  targetRoot,
  unifiedDiff,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/loop-edit.mjs";

/**
 * scripts/loop-edit.mjs — the loop-file editor (logs/CHANNEL_LOOP.md §10, tick 43): set-status, set-cell, insert-after,
 * replace-in-line and repoint-capture, each finding exactly one target or refusing with exit 2 and writing nothing (a
 * write that fails exits 3 and leaves the file as it was). The tick-43 fixer's tests (reviewer's defects 1-8) cover the
 * temporary-file write, table cell counts and table shape, linked folders, an empty status cell, URL ends and anchors.
 * The fixtures are real lines of logs/FABLE_QUEUE.md and logs/CHANNEL_LOOP.md (and two pre-repoint lines from git,
 * 729b6b9^: CHANNEL_LOOP :338 and FABLE_QUEUE :38), trimmed to a few lines of each file.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "loop-edit.mjs");
const FIX = join(ROOT, "src", "__tests__", "revenue", "fixtures", "loop-edit");
const QUEUE: string = readFileSync(join(FIX, "FABLE_QUEUE.excerpt.md"), "utf8");
const LOOP: string = readFileSync(join(FIX, "CHANNEL_LOOP.excerpt.md"), "utf8");

/** Fixture line numbers (1-based); the first test holds them true. */
const Q = { header: 5, row1: 7, row14: 8, row22: 9, row23: 10, row24: 11, row25: 12, probe: 18 };
const C = { ledger: 11, routine: 9, lastTick: 7, oss: 17, t1video: 18, topcoder: 24, btl: 25, indiebook: 26, freeze: 30, h9: 28, h10: 32, next: 34 };

const URLS_TXT = "# research/rendered/urls.txt\nhttps://www.btl.gov.il/a\tterms-btl\n";
const FROZEN_BTL = "research/rendered/terms-btl-2026-09-29.txt";

const scratch = mkdtempSync(join(tmpdir(), "loop-edit-test-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
let trees = 0;

/** A fresh repository-shaped tree in the scratch dir; `files` adds or replaces files (relative paths). */
function tree(files: Record<string, string | Buffer> = {}) {
  const root = join(scratch, `t${(trees += 1)}`);
  const all: Record<string, string | Buffer> = {
    "logs/FABLE_QUEUE.md": QUEUE,
    "logs/CHANNEL_LOOP.md": LOOP,
    "research/channel-loop/RULING-X.md": "# Ruling\n\n## Folds\n\n- one\n",
    "research/rendered/urls.txt": URLS_TXT,
    [FROZEN_BTL]: "frozen copy\n",
    ".git/HEAD": "ref: refs/heads/main\n",
    ...files,
  };
  for (const [rel, body] of Object.entries(all)) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), body);
  }
  return root;
}

const sha = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
/** The CLI, always on a scratch tree: a set-status without --file would edit the repository's own FABLE_QUEUE.md. */
function cli(args: string[], cwd = ROOT) {
  if (args[0] === "set-status" && !args.some((a) => a === "--file" || a.startsWith("--file="))) throw new Error("set-status needs --file in a test");
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: "utf8" });
}
const lineOf = (text: string, n: number) => text.split("\n")[n - 1];
const crlf = (text: string) => text.replace(/\n/g, "\r\n");

/** The two texts are byte for byte the same on every line but `changed` (1-based; same line count). */
function expectOnly(before: string, after: string, changed: number[]) {
  const a = Buffer.from(before).toString("binary").split("\n");
  const b = Buffer.from(after).toString("binary").split("\n");
  expect(b.length).toBe(a.length);
  const diff = a.flatMap((l, i) => (l === b[i] ? [] : [i + 1]));
  expect(diff).toEqual(changed);
}

/** A refusal: throws, and the message matches. */
function refused(fn: () => unknown, reason: RegExp) {
  let err: unknown;
  try {
    fn();
  } catch (e) {
    err = e;
  }
  expect(err, "expected a refusal").toBeInstanceOf(Error);
  expect((err as Error).name).toBe("Refusal");
  expect((err as Error).message).toMatch(reason);
}

describe("the fixtures are real loop-file lines", () => {
  it("holds the line numbers the tests use", () => {
    expect(lineOf(QUEUE, Q.header)).toBe("| # | Script | Fable agents | Reads | Writes | Then (on Opus, main thread) | Status |");
    for (const [k, n] of [["1", Q.row1], ["14", Q.row14], ["22", Q.row22], ["23", Q.row23], ["24", Q.row24], ["25", Q.row25]] as const) {
      expect(lineOf(QUEUE, n).startsWith(`| ${k} |`)).toBe(true);
    }
    expect(lineOf(QUEUE, Q.probe).startsWith("| 27.9 07:44 |")).toBe(true);
    expect(lineOf(LOOP, C.ledger)).toBe("| Running channels / ledger | 0 / ₪0.00 |");
    expect(lineOf(LOOP, C.routine).startsWith("| Routine | ")).toBe(true);
    expect(lineOf(LOOP, C.topcoder)).toContain("fetch https://api.topcoder.com/v6/challenges?status=ACTIVE and");
    expect(lineOf(LOOP, C.btl).startsWith("| — | ")).toBe(true);
    expect(lineOf(LOOP, C.indiebook)).toContain("אינדיבוק");
    expect(lineOf(LOOP, C.oss)).toContain("→");
    expect(lineOf(LOOP, C.freeze)).toContain("`terms-btl.txt:303` and `terms-ypay.txt:55`");
    expect(lineOf(LOOP, C.h10)).toBe("## 10. Next tick's first action");
    expect(lineOf(QUEUE, Q.row14)).toContain("gamedistribution-sdk-implementation.txt:275,281");
    expect(cells(lineOf(QUEUE, Q.row22)).length).toBe(STATUS_CELLS);
    expect(cells(lineOf(QUEUE, Q.row14)).length).toBe(7);
  });

  it("the real loop files and the fixtures parse and join back byte for byte (read only)", () => {
    for (const text of [QUEUE, LOOP, readFileSync(join(ROOT, "logs/FABLE_QUEUE.md"), "utf8"), readFileSync(join(ROOT, "logs/CHANNEL_LOOP.md"), "utf8")]) {
      expect(joinLines(parseLines(text))).toBe(text);
    }
  });

  it("CAPTURE_EXTS is freeze-capture.mjs's list", () => {
    expect(CAPTURE_EXTS).toEqual(FREEZE_EXTS);
  });
});

describe("lines and tables", () => {
  it("parseLines keeps each line's ending and whether the file ends with a newline", () => {
    expect(parseLines("a\nb\n")).toEqual([{ text: "a", eol: "\n" }, { text: "b", eol: "\n" }]);
    expect(parseLines("a\r\nb")).toEqual([{ text: "a", eol: "\r\n" }, { text: "b", eol: "" }]);
    expect(parseLines("")).toEqual([]);
    expect(parseLines("\n")).toEqual([{ text: "", eol: "\n" }]);
    for (const t of ["a\r\nb\nc", "x\n\n", "\r\n\r\n", "only"]) expect(joinLines(parseLines(t))).toBe(t);
  });

  it("splits a row on unescaped pipes only (GFM: an odd run of backslashes escapes)", () => {
    expect(cells("| a | b |")).toEqual([" a ", " b "]);
    expect(cells("| a \\| b | c |")).toEqual([" a \\| b ", " c "]);
    expect(cells("| a \\\\| b |")).toEqual([" a \\\\", " b "]);
    expect(cells("| a | b |  ")).toEqual([" a ", " b "]);
    expect(cells("| a | b")).toBeNull();
    expect(cells("| a | b \\|")).toBeNull();
    expect(cells("a | b |")).toBeNull();
    expect(separators("|a|`x|y`|")).toEqual([0, 2, 5, 8]);
  });

  it("finds each table's header and body rows (the delimiter row makes a table)", () => {
    expect(tables(parseLines(QUEUE)).map((t: { header: number; rows: number[] }) => [t.header + 1, t.rows.map((r) => r + 1)])).toEqual([
      [5, [7, 8, 9, 10, 11, 12]],
      [16, [18]],
    ]);
    expect(tables(parseLines("| a |\n| b |\n"))).toEqual([]);
  });
});

describe("set-status — FABLE_QUEUE's last cell", () => {
  it('prepends "<text> Was: " to the status cell, and changes nothing else', () => {
    const before = lineOf(QUEUE, Q.row22);
    const out = setStatus(QUEUE, { row: 22, text: "**DONE 6.10** (run x)." });
    const after = lineOf(out.text, Q.row22);
    const cb = cells(before);
    const ca = cells(after);
    expect(ca.slice(0, 7)).toEqual(cb.slice(0, 7));
    expect(ca[7]).toBe(` **DONE 6.10** (run x). Was: ${cb[7].trim()} `);
    expectOnly(QUEUE, out.text, [Q.row22]);
    expect(out.change).toEqual({ line: Q.row22, before: [before], after: [after] });
  });

  it("--replace replaces the status cell", () => {
    const out = setStatus(QUEUE, { row: 25, text: "**DONE 7.10**", mode: "replace" });
    expect(cells(lineOf(out.text, Q.row25))[7]).toBe(" **DONE 7.10** ");
    expectOnly(QUEUE, out.text, [Q.row25]);
  });

  it("on an empty status cell writes the text alone, with no dangling \"Was:\" (either mode)", () => {
    const src = QUEUE.replace(lineOf(QUEUE, Q.row25), `${lineOf(QUEUE, Q.row25)}\n| 26 |a|b|c|d|e|f| |`);
    for (const mode of ["prepend", "replace"]) {
      const out = setStatus(src, { row: 26, text: "DONE", mode });
      expect(lineOf(out.text, Q.row25 + 1)).toBe("| 26 |a|b|c|d|e|f| DONE |");
      expectOnly(src, out.text, [Q.row25 + 1]);
    }
  });

  it("keeps Hebrew and ₪ byte for byte (row 23)", () => {
    const out = setStatus(QUEUE, { row: 23, text: "נבדק → ₪0" });
    const cb = cells(lineOf(QUEUE, Q.row23));
    const ca = cells(lineOf(out.text, Q.row23));
    for (let k = 0; k < 7; k += 1) expect(Buffer.from(ca[k]).equals(Buffer.from(cb[k]))).toBe(true);
    expect(ca[7].startsWith(" נבדק → ₪0 Was: ")).toBe(true);
    expectOnly(QUEUE, out.text, [Q.row23]);
  });

  it("refuses a missing row, a duplicated row, and a row without 8 cells", () => {
    refused(() => setStatus(QUEUE, { row: 99, text: "x" }), /no table row whose first cell is "99"/);
    const dup = QUEUE.replace(lineOf(QUEUE, Q.row24), `${lineOf(QUEUE, Q.row22)}\n${lineOf(QUEUE, Q.row24)}`);
    refused(() => setStatus(dup, { row: 22, text: "x" }), /2 table rows have the first cell "22" \(lines 9, 11\)/);
    refused(() => setStatus(QUEUE, { row: 14, text: "x" }), /row 14 \(line 8\) has 7 cells, not 8/);
    refused(() => setStatus(QUEUE, { row: 1, text: "x" }), /has 7 cells, not 8/);
    const nine = `${QUEUE}| 26 | a | b | c | d | e | f | g | queued |\n`;
    refused(() => setStatus(nine, { row: 26, text: "x" }), /row 26 \(line 19\) has 9 cells, not 8/);
    const malformed = QUEUE.replace(lineOf(QUEUE, Q.row24), lineOf(QUEUE, Q.row24).replace(/ \|$/, ""));
    refused(() => setStatus(malformed, { row: 24, text: "x" }), /no parsable cells/);
  });

  it("refuses a bad row number, an empty or multi-line text, and a text that adds a cell", () => {
    for (const row of ["0", "x", "#", "2a", "", undefined]) refused(() => setStatus(QUEUE, { row, text: "x" }), /--row must be a row number/);
    refused(() => setStatus(QUEUE, { row: 22, text: "" }), /--text is empty/);
    refused(() => setStatus(QUEUE, { row: 22, text: "a\nb" }), /one line/);
    refused(() => setStatus(QUEUE, { row: 22, text: "a | b" }), /cell count would change/);
    refused(() => setStatus(QUEUE, { row: 22, text: "x", mode: "append" }), /unknown mode/);
    const escaped = setStatus(QUEUE, { row: 22, text: "a \\| b" });
    expect(cells(lineOf(escaped.text, Q.row22)).length).toBe(8);
  });

  it("never drops a URL from a status cell unless the text carries it", () => {
    const withUrl = setStatus(QUEUE, { row: 24, text: "see https://example.org/run/1", mode: "replace" }).text;
    refused(() => setStatus(withUrl, { row: 24, text: "done", mode: "replace" }), /"https:\/\/example.org\/run\/1" would be altered or removed/);
    expect(setStatus(withUrl, { row: 24, text: "done" }).text).toContain("done Was: see https://example.org/run/1");
    expect(setStatus(withUrl, { row: 24, text: "done, https://example.org/run/1", mode: "replace" }).text).toContain(" done, https://example.org/run/1 |");
  });
});

describe("set-cell — a row found by its first cell", () => {
  it("replaces a cell (₪ survives), and appends to another", () => {
    const out = setCell(LOOP, { rowKey: "Running channels / ledger", col: 2, text: "1 / ₪12.50" });
    expect(lineOf(out.text, C.ledger)).toBe("| Running channels / ledger | 1 / ₪12.50 |");
    expectOnly(LOOP, out.text, [C.ledger]);
    const app = setCell(LOOP, { rowKey: "T1 video", col: 6, text: "(tick 43)", append: true });
    expect(lineOf(app.text, C.t1video)).toBe("| T1 video | held by protocol | ₪0 experiment | Stage A, only after the day-56 web read | none | web arm passes at day 56 (tick 43) |");
    expectOnly(LOOP, app.text, [C.t1video]);
  });

  it("matches a non-ASCII key exactly, and a key in the second table of a file", () => {
    const out = setCell(LOOP, { rowKey: "—", col: 4, text: "(seen 4.10)", append: true });
    expect(lineOf(out.text, C.btl).endsWith(" (seen 4.10) |")).toBe(true);
    expectOnly(LOOP, out.text, [C.btl]);
    const probe = setCell(QUEUE, { rowKey: "27.9 07:44", col: 2, text: "(x)", append: true });
    expectOnly(QUEUE, probe.text, [Q.probe]);
  });

  it("refuses a missing or duplicated key; a header or delimiter row is never a key", () => {
    refused(() => setCell(LOOP, { rowKey: "T1 audio", col: 2, text: "x" }), /no table row whose first cell is "T1 audio"/);
    refused(() => setCell(LOOP, { rowKey: "T1", col: 2, text: "x" }), /no table row/);
    refused(() => setCell(LOOP, { rowKey: "Channel", col: 2, text: "x" }), /no table row/);
    refused(() => setCell(LOOP, { rowKey: "#", col: 2, text: "x" }), /no table row/);
    refused(() => setCell(LOOP, { rowKey: "---", col: 2, text: "x" }), /no table row/);
    const dup = LOOP.replace(lineOf(LOOP, C.indiebook), `${lineOf(LOOP, C.indiebook)}\n| — | other | x | y |`);
    refused(() => setCell(dup, { rowKey: "—", col: 4, text: "x" }), /2 table rows have the first cell "—"/);
    refused(() => setCell(LOOP, { rowKey: "", col: 2, text: "x" }), /--row-key is empty/);
  });

  it("refuses a row whose cell count is not its header's (FABLE_QUEUE rows 19+ have 8 cells, the header 7)", () => {
    refused(() => setCell(QUEUE, { rowKey: "22", col: 8, text: "x" }), /row "22" \(line 9\) has 8 cells, its table's header \(line 5\) 7/);
    expect(setCell(QUEUE, { rowKey: "1", col: 3, text: "judge", append: true }).text).not.toBe(QUEUE);
  });

  it("refuses a column out of range or not a number, and an empty text", () => {
    for (const col of [0, "0", "x", "2a", "", 1.5, undefined]) refused(() => setCell(LOOP, { rowKey: "T1 video", col, text: "x" }), /--col must be a column number/);
    refused(() => setCell(LOOP, { rowKey: "T1 video", col: 7, text: "x" }), /--col 7: the row has 6 cells/);
    refused(() => setCell(LOOP, { rowKey: "T1 video", col: 2, text: "" }), /--text is empty/);
    refused(() => setCell(LOOP, { rowKey: "T1 video", col: 2, text: "a | b" }), /cell count would change/);
    refused(() => setCell(LOOP, { rowKey: "T1 video", col: 2, text: "held by protocol" }), /changes nothing/);
  });

  it("never drops or alters a URL in the cell unless the text carries it", () => {
    refused(() => setCell(LOOP, { rowKey: "12", col: 3, text: "fetch the API" }), /"https:\/\/api.topcoder.com\/v6\/challenges\?status=ACTIVE" would be altered or removed/);
    expect(setCell(LOOP, { rowKey: "12", col: 3, text: "(read 4.10)", append: true }).text).toContain("member terms / AI policy (read 4.10) |");
    const url = "https://api.topcoder.com/v6/challenges?status=ACTIVE";
    expect(lineOf(setCell(LOOP, { rowKey: "12", col: 3, text: `fetch ${url}` }).text, C.topcoder)).toContain(`| fetch ${url} |`);
    expect(lineOf(setCell(LOOP, { rowKey: "Routine", col: 2, text: "see https://example.org/x" }).text, C.routine)).toBe("| Routine | see https://example.org/x |");
  });
});

describe("insert-after — after the one line that starts with the anchor", () => {
  it("inserts the lines, and the line count grows by exactly that many", () => {
    const out = insertAfter(LOOP, { anchor: "## 10. Next tick", text: "\n**Tick 44:** probe first." });
    const a = LOOP.split("\n");
    const b = out.text.split("\n");
    expect(b.length).toBe(a.length + 2);
    expect(b.slice(0, C.h10)).toEqual(a.slice(0, C.h10));
    expect(b.slice(C.h10, C.h10 + 2)).toEqual(["", "**Tick 44:** probe first."]);
    expect(b.slice(C.h10 + 2)).toEqual(a.slice(C.h10));
    expect(out.change).toEqual({ line: C.h10, before: [a[C.h10 - 1]], after: [a[C.h10 - 1], "", "**Tick 44:** probe first."] });
  });

  it("takes an exact line as its own prefix, and a long line by a unique prefix", () => {
    expect(insertAfter(LOOP, { anchor: "## 9. Maintenance backlog", text: "x" }).text.split("\n")[C.h9]).toBe("x");
    expect(insertAfter(LOOP, { anchor: "**Tick 43 (next", text: "- y" }).text.split("\n")[C.next]).toBe("- y");
  });

  it("refuses no match and more than one match", () => {
    refused(() => insertAfter(LOOP, { anchor: "## 11.", text: "x" }), /no line starts with the anchor/);
    refused(() => insertAfter(LOOP, { anchor: "## ", text: "x" }), /5 lines start with the anchor \(lines 3, 13, 20, 28, 32\)/);
    refused(() => insertAfter(LOOP, { anchor: "| ", text: "x" }), /lines start with the anchor/);
    refused(() => insertAfter("ab\nabc\n", { anchor: "a", text: "x" }), /2 lines start with the anchor \(lines 1, 2\)/);
    refused(() => insertAfter(LOOP, { anchor: "", text: "x" }), /--anchor is empty/);
    refused(() => insertAfter(LOOP, { anchor: "## 9.", text: "a\rb" }), /one line/);
  });

  it("a line equal to the anchor wins over the longer lines it starts; two equal lines are refused", () => {
    expect(insertAfter("a\nab\n", { anchor: "a", text: "x" }).text).toBe("a\nx\nab\n");
    expect(replaceInLine("ab\nabc\n", { anchor: "ab", old: "b", new: "B" }).text).toBe("aB\nabc\n");
    refused(() => insertAfter("a\nab\na\n", { anchor: "a", text: "x" }), /2 lines are the anchor \(lines 1, 3\)/);
    // A delimiter row that starts a wider table's delimiter row (CHANNEL_LOOP :22 and :107): a first body row can go in.
    const out = insertAfter(LOOP, { anchor: "|---|---|", text: "| Probe | first |" });
    expect(lineOf(out.text, 7)).toBe("| Probe | first |");
    expect(tables(parseLines(out.text))[0]).toEqual({ header: 4, rows: [6, 7, 8, 9, 10, 11] });
  });

  it("inside a table, inserts only rows with the header's cell count (the table must not be cut off)", () => {
    refused(() => insertAfter(QUEUE, { anchor: "| 22 |", text: "note: row 22 ran" }), /inserted line 1 is not a row of the table at line 5 \(7 cells\)/);
    refused(() => insertAfter(QUEUE, { anchor: "| 14 |", text: "" }), /inserted line 1 is not a row of the table at line 5/);
    refused(() => insertAfter(QUEUE, { anchor: "| 1 |", text: "| 2 | a | b |" }), /inserted line 1 has 3 cells, the table's header \(line 5\) 7/);
    refused(() => insertAfter(QUEUE, { anchor: "| 25 |", text: "| 26 | a | b | c | d | e | f | queued |" }), /inserted line 1 has 8 cells, the table's header \(line 5\) 7/);
    refused(() => insertAfter(QUEUE, { anchor: "| # | Script |", text: "| x |" }), /line 5 is a table's header row; insert after its delimiter row/);
    const row = "| 2 | `x.js` | judge | r | w | then | queued |";
    const out = insertAfter(QUEUE, { anchor: "| 1 |", text: row });
    expect(lineOf(out.text, Q.row1 + 1)).toBe(row);
    expect(tables(parseLines(out.text)).map((t: { header: number; rows: number[] }) => [t.header + 1, t.rows.map((r) => r + 1)])).toEqual([
      [5, [7, 8, 9, 10, 11, 12, 13]],
      [17, [19]],
    ]);
  });

  it("after a table's last line: rows, or an empty line first (a text line there would join the table)", () => {
    refused(() => insertAfter(QUEUE, { anchor: "| 27.9 07:44 |", text: "note" }), /inserted line 1 would join the table at line 16; start --text with an empty line/);
    refused(() => insertAfter(QUEUE, { anchor: "| 25 |", text: "| 26 | a | b | c | d | e | f |\nnote" }), /inserted line 2 would join the table at line 5/);
    expect(insertAfter(QUEUE, { anchor: "| 27.9 07:44 |", text: "| 4.10 13:00 | OK |" }).text).toBe(`${QUEUE}| 4.10 13:00 | OK |\n`);
    expect(insertAfter(QUEUE, { anchor: "| 27.9 07:44 |", text: "\nnote" }).text).toBe(`${QUEUE}\nnote\n`);
    expect(insertAfter(QUEUE, { anchor: "| 27.9 07:44 |", text: "\n| a | b |\n|---|---|\n| 1 | 2 |" }).text).toBe(`${QUEUE}\n| a | b |\n|---|---|\n| 1 | 2 |\n`);
  });

  it("refuses a line that would turn a table's header into a body line", () => {
    const t = "intro\n| h | i |\n|---|---|\n| 1 | 2 |\n";
    refused(() => insertAfter(t, { anchor: "intro", text: "| x | y |" }), /the edit would change the file's tables/);
    expect(insertAfter(t, { anchor: "intro", text: "more" }).text).toBe("intro\nmore\n| h | i |\n|---|---|\n| 1 | 2 |\n");
  });

  it("keeps CRLF, and a missing final newline stays missing", () => {
    const out = insertAfter(crlf(LOOP), { anchor: "## 9.", text: "one\ntwo" });
    expect(out.text.split("\r\n").length).toBe(LOOP.split("\n").length + 2);
    expect(/(^|[^\r])\n/.test(out.text)).toBe(false);
    expect(insertAfter("a\nb", { anchor: "b", text: "c" }).text).toBe("a\nb\nc");
    expect(insertAfter("a\r\nb", { anchor: "b", text: "c\r\nd" }).text).toBe("a\r\nb\r\nc\r\nd");
    expect(insertAfter("a\nb\n", { anchor: "a", text: "" }).text).toBe("a\n\nb\n");
  });
});

describe("replace-in-line — once, in the one line that starts with the anchor", () => {
  it("replaces the text once and changes nothing else", () => {
    const out = replaceInLine(LOOP, { anchor: "| Routine |", old: "every 6 h", new: "every 4 h" });
    expect(lineOf(out.text, C.routine)).toBe(lineOf(LOOP, C.routine).replace("every 6 h", "every 4 h"));
    expectOnly(LOOP, out.text, [C.routine]);
  });

  it("writes $ patterns literally", () => {
    const out = replaceInLine(LOOP, { anchor: "| Running channels", old: "₪0.00", new: "$& $1 ₪5" });
    expect(lineOf(out.text, C.ledger)).toBe("| Running channels / ledger | 0 / $& $1 ₪5 |");
  });

  it("refuses an absent text, a text that occurs twice (overlapping counts), and an ambiguous anchor", () => {
    refused(() => replaceInLine(LOOP, { anchor: "| Routine |", old: "every 9 h", new: "x" }), /--old does not occur in line 9/);
    refused(() => replaceInLine(LOOP, { anchor: "| Last tick |", old: "tick", new: "x" }), /--old occurs \d+ times in line 7/);
    refused(() => replaceInLine("aaa\n", { anchor: "a", old: "aa", new: "b" }), /occurs 2 times/);
    refused(() => replaceInLine(LOOP, { anchor: "| ", old: "x", new: "y" }), /lines start with the anchor/);
    refused(() => replaceInLine(LOOP, { anchor: "| Routine |", old: "", new: "x" }), /--old is empty/);
    refused(() => replaceInLine(LOOP, { anchor: "| Routine |", old: "6 h", new: "6 h" }), /are the same/);
    refused(() => replaceInLine(LOOP, { anchor: "| Routine |", old: "6 h", new: "6\nh" }), /one line/);
    refused(() => replaceInLine(LOOP, { anchor: "| Routine |", old: "6 h", new: undefined }), /--new is missing/);
  });

  it("never alters a URL unless the command's text carries it", () => {
    refused(() => replaceInLine(LOOP, { anchor: "| 12 |", old: "v6/challenges", new: "v7/challenges" }), /would be altered or removed/);
    const url = "https://api.topcoder.com/v6/challenges?status=ACTIVE";
    const next = url.replace("v6", "v7");
    expect(lineOf(replaceInLine(LOOP, { anchor: "| 12 |", old: url, new: next }).text, C.topcoder)).toContain(next);
    expect(lineOf(replaceInLine(LOOP, { anchor: "| Routine |", old: "every 6 h", new: "https://x.example/" }).text, C.routine)).toContain("https://x.example/");
    refused(() => replaceInLine("see http and ://y.example now\n", { anchor: "see", old: " and ", new: "s" }), /"https:\/\/y.example" would appear/);
    refused(() => replaceInLine("foo https://a.example bar\n", { anchor: "foo", old: " bar", new: "/x bar" }), /"https:\/\/a.example" would be altered or removed/);
  });

  it("refuses an edit that adds or removes a table cell (an unescaped \"|\" in --old or --new)", () => {
    refused(() => replaceInLine(LOOP, { anchor: "| Routine |", old: "every 6 h", new: "every 6 h | extra" }), /line 9: the row's cell count would change/);
    refused(() => replaceInLine("| a \\| b | c |\n", { anchor: "| a", old: "\\|", new: "|" }), /line 1: the row's cell count would change/);
    refused(() => replaceInLine("| x | y | z |\n", { anchor: "| x", old: "x | y", new: "x y" }), /line 1: the row's cell count would change/);
    refused(() => replaceInLine("| x | y |\n", { anchor: "| x", old: "y |", new: "y" }), /line 1: the row's cell count would change/);
    expect(lineOf(replaceInLine(LOOP, { anchor: "| Routine |", old: "every 6 h", new: "every 6 h \\| extra" }).text, C.routine)).toContain("every 6 h \\| extra (");
  });

  it("counts a URL that is on the line twice: losing one copy is a removal", () => {
    const two = "a https://x.example/p b https://x.example/p c\n";
    refused(() => replaceInLine(two, { anchor: "a ", old: "/p c", new: " c" }), /"https:\/\/x.example\/p" would be altered or removed/);
    refused(() => checkEdit(two, "a https://x.example/p b c\n", { line: 1, commandText: ["b c"] }), /"https:\/\/x.example\/p" would be altered or removed/);
  });

  it("sees a change at the end of a URL: a balanced \")\", a \"_\" or a \"*\"", () => {
    const wiki = "see https://en.wikipedia.org/wiki/Foo_(bar) now and https://x.example/a_b_ end\n";
    refused(() => replaceInLine(wiki, { anchor: "see", old: ") now", new: "] now" }), /"https:\/\/en.wikipedia.org\/wiki\/Foo_\(bar\)" would be altered or removed/);
    refused(() => replaceInLine(wiki, { anchor: "see", old: "b_ end", new: "b* end" }), /"https:\/\/x.example\/a_b_" would be altered or removed/);
    expect(protectedTokens("https://en.wikipedia.org/wiki/Foo_(bar), (https://a.example/x). [https://b.example/y]; {https://c.example/z}!")).toEqual([
      "https://en.wikipedia.org/wiki/Foo_(bar)",
      "https://a.example/x",
      "https://b.example/y",
      "https://c.example/z",
    ]);
    expect(protectedTokens("[https://polar.sh](https://polar.sh) and https://x.example/a_b_ and **https://y.example/q**")).toEqual([
      "https://polar.sh](https://polar.sh)",
      "https://x.example/a_b_",
      "https://y.example/q**",
    ]);
  });

  it("never alters a tab-separated slug unless the command's text carries it", () => {
    const tsv = "- https://a.example/x\tslug-a\n";
    expect(replaceInLine(tsv, { anchor: "- https", old: "\tslug-a", new: "\tslug-b" }).text).toBe("- https://a.example/x\tslug-b\n");
    refused(() => replaceInLine(tsv, { anchor: "- https", old: "g-a", new: "g-b" }), /"slug-a" would be altered or removed/);
  });
});

describe("repoint-capture — a live capture cited by line, to its frozen copy, on one line", () => {
  const has = (...names: string[]) => (name: string) => names.includes(name);

  it("repoints every '<live>.<ext>:' on the line and nothing else (CHANNEL_LOOP :338 before tick 38)", () => {
    const out = repointCapture(LOOP, { line: C.freeze, slug: "terms-btl", to: "terms-btl-2026-09-29", exists: has("terms-btl-2026-09-29.txt") });
    expect(lineOf(out.text, C.freeze)).toBe(lineOf(LOOP, C.freeze).replace("`terms-btl.txt:303`", "`terms-btl-2026-09-29.txt:303`"));
    expect(lineOf(out.text, C.freeze)).toContain("`terms-ypay.txt:55`");
    expectOnly(LOOP, out.text, [C.freeze]);
    expect(out.notes).toEqual([]);
  });

  it("repoints FABLE_QUEUE :38 as tick 38 did by hand", () => {
    const out = repointCapture(QUEUE, {
      line: Q.row14,
      slug: "gamedistribution-sdk-implementation",
      to: "gamedistribution-sdk-implementation-2026-09-28",
      exists: has("gamedistribution-sdk-implementation-2026-09-28.txt"),
    });
    expect(lineOf(out.text, Q.row14)).toContain("`gamedistribution-sdk-implementation-2026-09-28.txt:275,281`");
    expectOnly(QUEUE, out.text, [Q.row14]);
  });

  it("refuses when a frozen file is missing for an ext seen, and repoints every ext when all exist", () => {
    refused(() => repointCapture(LOOP, { line: C.freeze, slug: "terms-ypay", to: "terms-ypay-2026-09-29", exists: has() }), /research\/rendered\/terms-ypay-2026-09-29.txt does not exist/);
    const two = "a `terms-btl.txt:3`, `terms-btl.html:4`, `research/rendered/terms-btl.meta.json:2`\n";
    refused(() => repointCapture(two, { line: 1, slug: "terms-btl", to: "t-f", exists: has("t-f.txt", "t-f.meta.json") }), /t-f.html does not exist/);
    expect(repointCapture(two, { line: 1, slug: "terms-btl", to: "t-f", exists: has("t-f.txt", "t-f.html", "t-f.meta.json") }).text).toBe(
      "a `t-f.txt:3`, `t-f.html:4`, `research/rendered/t-f.meta.json:2`\n",
    );
  });

  it("touches the target line only, though another line cites the same capture", () => {
    const twice = `${LOOP}${lineOf(LOOP, C.freeze)}\n`;
    const out = repointCapture(twice, { line: C.freeze, slug: "terms-btl", to: "terms-btl-2026-09-29", exists: has("terms-btl-2026-09-29.txt") });
    expectOnly(twice, out.text, [C.freeze]);
  });

  it("matches the slug whole: a longer slug, a frozen name or a bare mention is not a citation by line", () => {
    const text = "`xterms-btl.txt:5` `terms-btl-2026-09-29.txt:7` `terms-btl.txt.bak:1` `terms-btl.txt` `terms-btl.txt:9`\n";
    const out = repointCapture(text, { line: 1, slug: "terms-btl", to: "terms-btl-2026-09-29", exists: has("terms-btl-2026-09-29.txt") });
    expect(out.text).toBe("`xterms-btl.txt:5` `terms-btl-2026-09-29.txt:7` `terms-btl.txt.bak:1` `terms-btl.txt` `terms-btl-2026-09-29.txt:9`\n");
    expect(out.notes).toEqual(["line 1 still names terms-btl 1 time(s) without a line; left as written"]);
    refused(() => repointCapture("`xterms-btl.txt:5`\n", { line: 1, slug: "terms-btl", to: "f", exists: has("f.txt") }), /cites no "terms-btl.<ext>:"/);
  });

  it("refuses a line without the citation, a bad slug, the same slug, and a line out of range", () => {
    const ok = has("terms-btl-2026-09-29.txt");
    refused(() => repointCapture(LOOP, { line: C.next, slug: "terms-btl", to: "terms-btl-2026-09-29", exists: ok }), /line 34 cites no/);
    refused(() => repointCapture(LOOP, { line: C.freeze, slug: "../terms-btl", to: "x", exists: ok }), /--slug must be a capture slug/);
    refused(() => repointCapture(LOOP, { line: C.freeze, slug: "terms-btl", to: "Terms", exists: ok }), /--to must be a capture slug/);
    refused(() => repointCapture(LOOP, { line: C.freeze, slug: "terms-btl", to: "terms-btl", exists: ok }), /are the same/);
    for (const line of [0, 35, "x", "3a", undefined]) refused(() => repointCapture(LOOP, { line, slug: "terms-btl", to: "f", exists: ok }), /is not a line of the file/);
  });

  it("refuses when the citation sits inside a URL", () => {
    const text = "see https://mirror.example/terms-btl.txt:80 and `terms-btl.txt:3`\n";
    refused(() => repointCapture(text, { line: 1, slug: "terms-btl", to: "f", exists: has("f.txt") }), /"https:\/\/mirror.example\/terms-btl.txt:80" would be altered/);
  });
});

describe("checkEdit — the invariants every edit passes before it is written", () => {
  const A = "one\n| a | https://x.example/p | c |\nthree\r\nfour\n";
  const ok = (after: string, opts = {}) => checkEdit(A, after, { line: 2, ...opts });

  it("accepts a one-line edit of the target", () => {
    expect(ok("one\n| a | https://x.example/p | C |\nthree\r\nfour\n", { cell: 3 })).toBe(true);
  });

  it("refuses a line count that changes, unless by the inserted lines", () => {
    refused(() => ok("one\n| a | https://x.example/p | c |\nextra\nthree\r\nfour\n"), /the edit has 5 lines, the file 4/);
    refused(() => ok("one\n| a | https://x.example/p | C |\nthree\r\n"), /the edit has 3 lines/);
    expect(ok("one\n| a | https://x.example/p | c |\nextra\nthree\r\nfour\n", { inserted: 1, insertedText: ["extra"] })).toBe(true);
  });

  it("refuses any change to a line other than the target, its ending included", () => {
    refused(() => ok("onE\n| a | https://x.example/p | C |\nthree\r\nfour\n"), /line 1 would change/);
    refused(() => ok("one\n| a | https://x.example/p | C |\nthree\nfour\n"), /line 3 would change/);
    refused(() => ok("one\n| a | https://x.example/p | C |\r\nthree\r\nfour\n"), /line 2's line ending would change/);
    refused(() => ok("one\n| a | https://x.example/p | C |\nthree\r\nfour"), /ends with a newline/);
    refused(() => checkEdit(A, A, { line: 9 }), /line 9 is not a line of the file/);
  });

  it("refuses a URL altered, removed or created on the target line unless the command's text has it", () => {
    refused(() => ok("one\n| a | https://x.example/q | c |\nthree\r\nfour\n"), /would be altered or removed/);
    refused(() => ok("one\n| a | gone | c |\nthree\r\nfour\n"), /would be altered or removed/);
    refused(() => ok("one\n| a | https://x.example/p https://y.example | c |\nthree\r\nfour\n"), /"https:\/\/y.example" would appear/);
    expect(ok("one\n| a | https://x.example/q | c |\nthree\r\nfour\n", { commandText: ["https://x.example/p", "https://x.example/q"] })).toBe(true);
    expect(ok("one\n| a | https://x.example/p. | c |\nthree\r\nfour\n")).toBe(true);
    expect(protectedTokens("(https://a.example/x), `https://b.example/y`.")).toEqual(["https://a.example/x", "https://b.example/y"]);
    expect(protectedTokens("https://a.example/x\tslug-a\tjs")).toEqual(["https://a.example/x", "slug-a", "js"]);
    expect(protectedTokens("a slug-a b")).toEqual([]);
  });

  it("refuses a changed cell count on a table line with or without a cell, and a changed table", () => {
    refused(() => ok("one\n| a | https://x.example/p | c | d |\nthree\r\nfour\n"), /line 2: the row's cell count would change/);
    refused(() => ok("one\na | https://x.example/p | c |\nthree\r\nfour\n"), /line 2: the row's cell count would change/);
    const T = "| h | i |\n|---|---|\n| 1 | 2 |\n";
    refused(() => checkEdit(T, "| h | i |\n|---|-x-|\n| 1 | 2 |\n", { line: 2 }), /the edit would change the file's tables/);
  });

  it("for an insertion too, refuses a file that gains or loses its final newline", () => {
    refused(() => checkEdit("a\nb", "a\nb\nc\n", { line: 2, inserted: 1, insertedText: ["c"] }), /ends with a newline/);
    expect(checkEdit("a\nb", "a\nb\nc", { line: 2, inserted: 1, insertedText: ["c"] })).toBe(true);
  });

  it("with a cell, refuses another cell's change and a changed cell count", () => {
    refused(() => ok("one\n| A | https://x.example/p | C |\nthree\r\nfour\n", { cell: 3 }), /cell 1 would change, and the edit is to cell 3/);
    refused(() => ok("one\n| a | https://x.example/p | c | d |\nthree\r\nfour\n", { cell: 3 }), /cell count would change/);
  });

  it("for an insertion, refuses a changed anchor, a line not from the text, and another line ending", () => {
    const ins = (after: string, text = ["x"]) => checkEdit(A, after, { line: 2, inserted: text.length, insertedText: text });
    refused(() => ins("one\n| a | https://x.example/p | C |\nx\nthree\r\nfour\n"), /the anchor, line 2, would change/);
    refused(() => ins("one\n| a | https://x.example/p | c |\ny\nthree\r\nfour\n"), /inserted line 3 is not line 1 of --text/);
    refused(() => ins("one\n| a | https://x.example/p | c |\nx\r\nthree\r\nfour\n"), /another line ending than the anchor/);
    refused(() => ins("one\n| a | https://x.example/p | c |\r\nx\r\nthree\r\nfour\n"), /the anchor's line ending would change/);
  });
});

describe("the CLI", () => {
  it("writes the edit, prints the line as a unified diff, exits 0", () => {
    const root = tree();
    const file = join(root, "logs/FABLE_QUEUE.md");
    const r = cli(["set-status", "--file", file, "--row", "22", "--text", "**DONE 6.10**"]);
    expect(r.status).toBe(0);
    const before = lineOf(QUEUE, Q.row22);
    const after = lineOf(readFileSync(file, "utf8"), Q.row22);
    expect(r.stdout).toContain(`--- ${file}\n+++ ${file}\n@@ -9 +9 @@\n-${before}\n+${after}\n`);
    expect(r.stdout).toContain("loop-edit: written");
    expectOnly(QUEUE, readFileSync(file, "utf8"), [Q.row22]);
  });

  it("--replace and --append reach their commands", () => {
    const root = tree();
    const q = join(root, "logs/FABLE_QUEUE.md");
    const l = join(root, "logs/CHANNEL_LOOP.md");
    expect(cli(["set-status", "--file", q, "--row", "25", "--text", "**DONE**", "--replace"]).status).toBe(0);
    expect(cells(lineOf(readFileSync(q, "utf8"), Q.row25))[7]).toBe(" **DONE** ");
    expect(cli(["set-status", "--file", q, "--row", "24", "--text", "seen", "--prepend"]).status).toBe(0);
    expect(cells(lineOf(readFileSync(q, "utf8"), Q.row24))[7].startsWith(" seen Was: ")).toBe(true);
    expect(cli(["set-cell", "--file", l, "--row-key", "T1 video", "--col", "5", "--text", "(4.10)", "--append"]).status).toBe(0);
    expect(cells(lineOf(readFileSync(l, "utf8"), C.t1video))[4]).toBe(" none (4.10) ");
    expect(cli(["set-cell", "--file", l, "--row-key", "T1 video", "--col", "5", "--text", "later"]).status).toBe(0);
    expect(cells(lineOf(readFileSync(l, "utf8"), C.t1video))[4]).toBe(" later ");
  });

  it("refuses, and keeps the other writer's bytes, when the file changes during the edit", () => {
    const root = tree();
    const q = join(root, "logs/FABLE_QUEUE.md");
    const original = COMMANDS["set-status"];
    try {
      COMMANDS["set-status"] = (src: string, o: unknown) => {
        writeFileSync(q, `${src}| 26 | late | row | x | y | z | w | queued |\n`);
        return original(src, o);
      };
      refused(() => runCommand("set-status", { file: q, row: "22", text: "x" }), /changed while it was being edited/);
    } finally {
      COMMANDS["set-status"] = original;
    }
    expect(readFileSync(q, "utf8")).toBe(`${QUEUE}| 26 | late | row | x | y | z | w | queued |\n`);
    expect(readdirSync(join(root, "logs")).sort()).toEqual(["CHANNEL_LOOP.md", "FABLE_QUEUE.md"]);
  });

  it("refuses a concurrent change of the same length (sha256, not the size), and leaves no temporary file", () => {
    const root = tree();
    const q = join(root, "logs/FABLE_QUEUE.md");
    const original = COMMANDS["set-status"];
    const theirs = QUEUE.replace("# Fable queue", "# FABLE queue");
    expect(theirs.length).toBe(QUEUE.length);
    try {
      COMMANDS["set-status"] = (src: string, o: unknown) => {
        writeFileSync(q, theirs);
        return original(src, o);
      };
      refused(() => runCommand("set-status", { file: q, row: "22", text: "x" }), /changed while it was being edited/);
    } finally {
      COMMANDS["set-status"] = original;
    }
    expect(readFileSync(q, "utf8")).toBe(theirs);
    expect(readdirSync(join(root, "logs")).sort()).toEqual(["CHANNEL_LOOP.md", "FABLE_QUEUE.md"]);
  });

  it("a write that fails leaves the file as it was and no temporary file, says \"write failed\" and exits 3", () => {
    // ulimit -f 20 caps a written file at 20,480 bytes: the edit cannot be written in full (the reviewer's EFBIG case).
    const big = `${QUEUE}\n${"a filler line that makes the file bigger than the cap\n".repeat(600)}`;
    expect(big.length).toBeGreaterThan(30000);
    const root = tree({ "logs/FABLE_QUEUE.md": big });
    const file = join(root, "logs/FABLE_QUEUE.md");
    const was = sha(file);
    const capped = ["-c", 'ulimit -f 20 && exec "$@"', "bash", process.execPath, SCRIPT];
    const r = spawnSync("bash", [...capped, "set-status", "--file", file, "--row", "22", "--text", "DONE"], { encoding: "utf8" });
    expect(r.status).toBe(3);
    expect(r.stderr).toMatch(/^loop-edit: write failed: .*EFBIG.*; the file is as it was\n$/);
    expect(r.stderr).not.toContain("refused");
    expect(sha(file)).toBe(was);
    expect(readdirSync(join(root, "logs")).sort()).toEqual(["CHANNEL_LOOP.md", "FABLE_QUEUE.md"]);
    // The same edit without the cap is written (the cap, not the edit, failed).
    expect(cli(["set-status", "--file", file, "--row", "22", "--text", "DONE"]).status).toBe(0);
  });

  it("writes through a temporary file renamed over the target: the mode is kept, nothing else is left", () => {
    const root = tree();
    const file = join(root, "logs/FABLE_QUEUE.md");
    chmodSync(file, 0o600);
    expect(cli(["set-status", "--file", file, "--row", "22", "--text", "DONE"]).status).toBe(0);
    expect(statSync(file).mode & 0o7777).toBe(0o600);
    expect(lineOf(readFileSync(file, "utf8"), Q.row22)).toContain("| DONE Was: ");
    expect(readdirSync(join(root, "logs")).sort()).toEqual(["CHANNEL_LOOP.md", "FABLE_QUEUE.md"]);
  });

  it("--dry-run prints the diff and writes nothing", () => {
    const root = tree();
    const file = join(root, "logs/CHANNEL_LOOP.md");
    const was = sha(file);
    const r = cli(["insert-after", "--dry-run", "--file", file, "--anchor", "## 9.", "--text=- a bullet"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain(`@@ -${C.h9} +${C.h9},2 @@\n ## 9. Maintenance backlog\n+- a bullet\n`);
    expect(r.stdout).toContain("dry run, nothing written");
    expect(sha(file)).toBe(was);
  });

  it("every command's refusal exits 2, says why, and leaves the file's sha256 as it was", () => {
    const root = tree();
    const q = join(root, "logs/FABLE_QUEUE.md");
    const l = join(root, "logs/CHANNEL_LOOP.md");
    const runs: [string, string[]][] = [
      [q, ["set-status", "--file", q, "--row", "14", "--text", "x"]],
      [q, ["set-cell", "--file", q, "--row-key", "22", "--col", "8", "--text", "x"]],
      [l, ["insert-after", "--file", l, "--anchor", "## ", "--text", "x"]],
      [l, ["replace-in-line", "--file", l, "--anchor", "| 12 |", "--old", "v6", "--new", "v7"]],
      [l, ["repoint-capture", "--file", l, "--line", String(C.freeze), "--slug", "terms-ypay", "--to", "terms-ypay-2026-09-29"]],
    ];
    for (const [file, args] of runs) {
      const was = sha(file);
      const r = cli(args);
      expect(r.status, args.join(" ")).toBe(2);
      expect(r.stderr).toMatch(/loop-edit: refused: .+; nothing written/);
      expect(r.stdout).toBe("");
      expect(sha(file)).toBe(was);
    }
  });

  it("repoint-capture checks research/rendered in the target's own repository", () => {
    const root = tree();
    const file = join(root, "logs/CHANNEL_LOOP.md");
    const r = cli(["repoint-capture", "--file", file, "--line", String(C.freeze), "--slug", "terms-btl", "--to", "terms-btl-2026-09-29"]);
    expect(r.status).toBe(0);
    expect(lineOf(readFileSync(file, "utf8"), C.freeze)).toContain("`terms-btl-2026-09-29.txt:303`");
    const other = tree({ [FROZEN_BTL]: "x" });
    rmSync(join(other, FROZEN_BTL));
    const f2 = join(other, "logs/CHANNEL_LOOP.md");
    const was = sha(f2);
    expect(cli(["repoint-capture", "--file", f2, "--line", String(C.freeze), "--slug", "terms-btl", "--to", "terms-btl-2026-09-29"]).status).toBe(2);
    expect(sha(f2)).toBe(was);
  });

  it("edits logs/*.md and research/channel-loop/*.md only: urls.txt and the rest are refused untouched", () => {
    const others = ["research/channel-loop/terms/x.md", "logs/notes.txt", "products/p/README.md", "research/measurements/m.md", "products/channel-loop/x.md", "logs/sub/x.md"];
    const root = tree(Object.fromEntries(others.map((rel) => [rel, "a\n"])));
    for (const rel of ["research/rendered/urls.txt", ...others]) {
      const file = join(root, rel);
      const was = sha(file);
      const r = cli(["insert-after", "--file", file, "--anchor", rel.endsWith("urls.txt") ? "https://www.btl" : "a", "--text", "x"]);
      expect(r.status, rel).toBe(2);
      expect(r.stderr).toContain("edits logs/*.md and research/channel-loop/*.md only");
      expect(sha(file)).toBe(was);
    }
    expect(cli(["insert-after", "--file", join(root, "research/channel-loop/RULING-X.md"), "--anchor", "## Folds", "--text=- two"]).status).toBe(0);
    expect(targetRoot(join(root, "logs", "X.md"))).toBe(root);
    expect(targetRoot(join(root, "research", "channel-loop", "X.md"))).toBe(root);
  });

  it("refuses a path through a linked folder, and a logs/ or research/ that is not at a repository's root", () => {
    const root = tree({ "research/rendered/README.md": "# R\n" });
    const rendered = join(root, "research/rendered/README.md");
    const was = sha(rendered);
    rmSync(join(root, "research/channel-loop"), { recursive: true });
    symlinkSync(join(root, "research/rendered"), join(root, "research/channel-loop"));
    const viaDir = cli(["insert-after", "--file", join(root, "research/channel-loop/README.md"), "--anchor", "# R", "--text", "x"]);
    expect(viaDir.status).toBe(2);
    expect(viaDir.stderr).toContain("passes through a symbolic link");
    const linkedLogs = tree({ "research/rendered/README.md": "# R\n" });
    rmSync(join(linkedLogs, "logs"), { recursive: true });
    symlinkSync(join(linkedLogs, "research/rendered"), join(linkedLogs, "logs"));
    expect(cli(["insert-after", "--file", join(linkedLogs, "logs/README.md"), "--anchor", "# R", "--text", "x"]).stderr).toContain("passes through a symbolic link");
    expect(sha(rendered)).toBe(was);
    expect(sha(join(linkedLogs, "research/rendered/README.md"))).toBe(was);
    // node_modules/pkg/logs/x.md: logs/ is there, but its parent is no repository root (no .git).
    const nested = join(root, "node_modules/pkg/logs/x.md");
    mkdirSync(dirname(nested), { recursive: true });
    writeFileSync(nested, "a\n");
    const r = cli(["insert-after", "--file", nested, "--anchor", "a", "--text", "x"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("is not a repository's root (no .git)");
    expect(readFileSync(nested, "utf8")).toBe("a\n");
    expect(() => targetRoot(join(root, "node_modules/pkg/research/channel-loop/x.md"))).toThrow(/no \.git/);
    // A repository reached through a link to its root is still that repository.
    const alias = join(scratch, `alias${trees}`);
    symlinkSync(tree(), alias);
    expect(cli(["insert-after", "--file", join(alias, "logs/CHANNEL_LOOP.md"), "--anchor", "## 9.", "--text", "x"]).status).toBe(0);
  });

  it("refuses a symbolic link, a missing file and a file that is not UTF-8", () => {
    const root = tree({ "logs/BAD.md": Buffer.from([0x61, 0x0a, 0xff, 0xfe, 0x0a]) });
    symlinkSync(join(root, "research/rendered/urls.txt"), join(root, "logs/LINK.md"));
    const urls = sha(join(root, "research/rendered/urls.txt"));
    const link = cli(["insert-after", "--file", join(root, "logs/LINK.md"), "--anchor", "https://www.btl", "--text", "x"]);
    expect(link.status).toBe(2);
    expect(link.stderr).toContain("is a symbolic link");
    expect(sha(join(root, "research/rendered/urls.txt"))).toBe(urls);
    expect(cli(["insert-after", "--file", join(root, "logs/NONE.md"), "--anchor", "a", "--text", "x"]).stderr).toContain("does not exist");
    const bad = join(root, "logs/BAD.md");
    const was = sha(bad);
    const r = cli(["insert-after", "--file", bad, "--anchor", "a", "--text", "x"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("is not valid UTF-8");
    expect(sha(bad)).toBe(was);
  });

  it("keeps CRLF, a missing final newline, Hebrew, ₪ and → byte for byte", () => {
    const body = crlf(QUEUE).replace(/\r\n$/, "");
    const root = tree({ "logs/FABLE_QUEUE.md": body });
    const file = join(root, "logs/FABLE_QUEUE.md");
    expect(cli(["set-status", "--file", file, "--row", "23", "--text", "נבדק → ₪0"]).status).toBe(0);
    const out = readFileSync(file);
    const was = Buffer.from(body);
    const split = (b: Buffer) => b.toString("binary").split("\r\n");
    expect(split(out).length).toBe(split(was).length);
    expect(split(out).filter((l, i) => l !== split(was)[i]).length).toBe(1);
    expect(out.subarray(-3).equals(was.subarray(-3))).toBe(true);
    expect(/(^|[^\r])\n/.test(out.toString("utf8"))).toBe(false);
    expect(lineOf(out.toString("utf8").replace(/\r\n/g, "\n"), Q.row23)).toContain("| נבדק → ₪0 Was: ");
  });

  it("set-status defaults to the repository's logs/FABLE_QUEUE.md; no test runs a writer on a real file", () => {
    // Parsed, never run: under mutation (a --dry-run that writes) a CLI run here would edit the real queue (tick 43).
    const [command, values, dryRun] = parseCommand(["set-status", "--row", "25", "--text", "x", "--dry-run"]);
    expect(command).toBe("set-status");
    expect(values.file).toBe(join(ROOT, "logs", "FABLE_QUEUE.md"));
    expect(dryRun).toBe(true);
    expect(parseCommand(["set-status", "--file", "logs/X.md", "--row", "1", "--text", "x"])[1].file).toBe("logs/X.md");
    expect(() => parseCommand(["set-cell", "--row-key", "1", "--col", "2", "--text", "x"])).toThrow(/set-cell needs --file/);
    // The real queue (read only): rows since 19 have the 8 cells set-status needs.
    const real = parseLines(readFileSync(join(ROOT, "logs/FABLE_QUEUE.md"), "utf8")).map((l: { text: string }) => cells(l.text));
    expect(real.some((c: string[] | null) => c && c.length === STATUS_CELLS && /^\d+$/.test(c[0].trim()))).toBe(true);
  });

  it("usage errors exit 2 and write nothing", () => {
    const root = tree();
    const q = join(root, "logs/FABLE_QUEUE.md");
    const was = sha(q);
    for (const args of [
      [],
      ["edit"],
      ["set-status", "--file", q, "--row", "22", "--text", "x", "--prepend", "--replace"],
      ["set-status", "--file", q, "--row", "22", "--text", "x", "--anchor", "a"],
      ["set-status", "--file", q, "--text", "x"],
      ["set-cell", "--row-key", "22", "--col", "2", "--text", "x"],
      ["insert-after", "--file", q, "--anchor", "## Q", "--text", "-x"],
      ["replace-in-line", "--file", q, "--anchor", "| 22", "--old", "x"],
      ["repoint-capture", "--file", q, "--line", "8", "--slug", "a"],
      ["set-status", "--file", q, "--row", "22", "--text", "x", "extra"],
    ]) {
      const r = cli(args);
      expect(r.status, args.join(" ")).toBe(2);
      expect(r.stderr).toContain("usage: node scripts/loop-edit.mjs");
    }
    expect(sha(q)).toBe(was);
  });

  it("runCommand is the same path as the CLI: a refusal throws before any write", () => {
    const root = tree();
    const q = join(root, "logs/FABLE_QUEUE.md");
    const was = sha(q);
    refused(() => runCommand("set-status", { file: q, row: "99", text: "x" }), /no table row/);
    refused(() => runCommand("nope", { file: q }), /unknown command/);
    refused(() => runCommand("set-status", { row: "22", text: "x" }), /--file is missing/);
    expect(sha(q)).toBe(was);
    const out = runCommand("set-status", { file: q, row: "25", text: "x" }, { dryRun: true });
    expect(out.written).toBe(false);
    expect(sha(q)).toBe(was);
    expect(unifiedDiff("f", { line: 3, before: ["a"], after: ["b"] })).toBe("--- f\n+++ f\n@@ -3 +3 @@\n-a\n+b");
  });
});
