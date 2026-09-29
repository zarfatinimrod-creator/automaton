/**
 * BOARD-LOOP §13, the rules-page half of the AI-allowed prize-event intake (CHANNEL_LOOP.md §4 row 13).
 *
 * The board's number is a count of events per quarter whose own rules pages EXPLICITLY permit AI-built entries with no
 * human-authorship attestation. A machine must not guess that from prose, so the weekly job only lists the events whose
 * deadline falls in the current or next calendar quarter, in a table a reading session grades from rendered rules
 * pages, plus the URLs still awaiting a reading in render-watch's urls syntax. These tests pin the split: the job
 * carries a session's cells forward and never fills one itself; it never writes "yes"; a quarter's qualifying count is
 * null until a row is graded; and the kill is computed only from closed, fully graded quarters.
 *
 * Fixture: the same 14 real mlcontests entries the list-count half uses (src/__tests__/fixtures/mlcontests-*).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import {
  AI_ALLOWED_TABLE_FILE,
  AI_ALLOWED_URLS_FILE,
  TABLE_COLUMNS,
  buildAiAllowedTable,
  computeKill,
  isRefusedForRender,
  parseAiAllowedTable,
  quarterOf,
  renderSlug,
  rowState,
  windowQuarters,
  type AiAllowedQuarter,
  type ListedEvent,
} from "../../revenue/ai-allowed-events.js";
import { PRIZE_INTAKE_FILE, listedEventsFrom, readPrizeIntake, runPrizeIntake, summarisePrizeIntake } from "../../revenue/prize-intake.js";
import { renderReport, tick } from "../../revenue/runner.js";
// @ts-expect-error — plain ESM script, no type declarations by design (same as render-watch.test.ts)
import { parseUrlList } from "../../../scripts/render-watch.mjs";

const FIXTURES = resolve(dirname(fileURLToPath(import.meta.url)), "..", "fixtures");
const FIXTURE_TEXT = readFileSync(join(FIXTURES, "mlcontests-competitions-trimmed.json"), "utf8");
const FIXTURE_DATA = JSON.parse(FIXTURE_TEXT).data as Record<string, unknown>[];
const MEASURED = "2026-09-29T05:41:00Z";
const T0 = Date.parse(MEASURED);

const ARC = "https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-2?ref=mlcontests";
const ZINDI = "https://zindi.africa/competitions/caribbean-voices-hackathon?utm_source=mlcontest&utm_medium=referral&utm_campaign=compupdates";
const BIOHUB = "https://www.kaggle.com/competitions/biohub-cell-tracking-during-development?ref=mlcontests";
const ANSP = "https://ansperformance.eu/study/data-challenge/dc2026/";

const listOf = (entries: Record<string, unknown>[]) => JSON.stringify({ data: entries });
const fakeFetch = (body: string) => (async () => new Response(body, { status: 200 })) as unknown as typeof fetch;

/** The session columns of a table, as the job wrote them. */
const sessionCells = (md: string) => parseAiAllowedTable(md).map((r) => [r.clause, r.grade, r.qualifies]);

/** What a reading session does by hand: replace the last three cells of the row whose key is `url`. */
function fill(md: string, url: string, cells: { clause: string; grade: string; qualifies: string }): string {
  let hits = 0;
  const out = md
    .split("\n")
    .map((line) => {
      if (!line.startsWith("|") || !line.includes(`| <${url}> |`)) return line;
      hits += 1;
      // Split on the pipes GitHub treats as cell borders; an escaped pipe stays inside its cell.
      const parts = line.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim());
      parts.splice(5, 3, cells.clause, cells.grade, cells.qualifies);
      return `| ${parts.join(" | ")} |`;
    })
    .join("\n");
  expect(hits, `row ${url}`).toBe(1);
  return out;
}

describe("quarters — the list's own deadline decides the window", () => {
  it("names the calendar quarter of a date, and the window as the current and the next quarter", () => {
    expect(quarterOf("2026-09-29")).toBe("2026-Q3");
    expect(quarterOf("2026-10-01")).toBe("2026-Q4");
    expect(quarterOf("2026-12-31")).toBe("2026-Q4");
    expect(quarterOf("2027-01-01")).toBe("2027-Q1");
    expect(windowQuarters("2026-09-29")).toEqual(["2026-Q3", "2026-Q4"]);
    expect(windowQuarters("2026-11-15")).toEqual(["2026-Q4", "2027-Q1"]);
  });

  it("reads each event's name, deadline, prize and URLs verbatim from the list, skipping undatable entries", () => {
    const events = listedEventsFrom(FIXTURE_TEXT);
    expect(events).toHaveLength(13); // 14 listed, one deadline ("11 May 2026 Apr 2026") does not parse
    const arc = events.find((e) => e.url === ARC)!;
    expect(arc).toEqual({ name: "ARC Prize 2026 - ARC-AGI-2", deadline: "2026-11-02", prize: "$700,000", url: ARC, otherUrls: [] });
    const ansp = events.find((e) => e.url === ANSP)!;
    expect(ansp.otherUrls).toHaveLength(8);
    expect(ansp.otherUrls).toContain("https://ansperformance.eu/study/data-challenge/dc2026/eligibility.html");
    expect(events.find((e) => e.name === "Generative AI for Antimicrobial Peptide Design")!.prize).toBeNull();
  });
});

describe("the first weekly run — a table for a session to fill, with nothing filled", () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "prize-rules-"));
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  const run = async (body = FIXTURE_TEXT, nowIso = MEASURED) => {
    const r = await runPrizeIntake({ root, nowIso, fetchImpl: fakeFetch(body) });
    expect(r.code, r.message).toBe(0);
    return {
      r,
      md: readFileSync(join(root, AI_ALLOWED_TABLE_FILE), "utf8"),
      urls: readFileSync(join(root, AI_ALLOWED_URLS_FILE), "utf8"),
      state: JSON.parse(readFileSync(join(root, PRIZE_INTAKE_FILE), "utf8")),
    };
  };

  it("lists every event with a deadline in the current or next quarter, and only those", async () => {
    const { md } = await run();
    const rows = parseAiAllowedTable(md);
    expect(rows).toHaveLength(9); // 1 in 2026-Q3 (the biohub deadline, 29 Sep), 8 in 2026-Q4
    expect(rows.map((r) => quarterOf(r.deadline)).sort()).toEqual(["2026-Q3", ...Array(8).fill("2026-Q4")]);
    const arc = rows.find((r) => r.url === ARC)!;
    expect(arc).toMatchObject({ name: "ARC Prize 2026 - ARC-AGI-2", deadline: "2026-11-02", prize: "$700,000" });
    expect(rows.find((r) => r.url === ANSP)!.otherUrls).toHaveLength(8);
    // A past event, an undatable one and a 2025 one are not in the window.
    expect(md).not.toContain("Real-Time Market Data Forecasting");
    expect(md).not.toContain("luma.com");
    expect(md).toMatch(/^## 2026-Q3 — deadlines 1 Jul – 30 Sep 2026 \(current quarter\)$/m);
    expect(md).toMatch(/^## 2026-Q4 — deadlines 1 Oct – 31 Dec 2026 \(next quarter\)$/m);
    expect(md).toContain(`| ${TABLE_COLUMNS.join(" | ")} |`);
  });

  it("fills none of the three session cells, and writes no verdict anywhere", async () => {
    const { md } = await run();
    for (const cells of sessionCells(md)) expect(cells).toEqual(["", "", ""]);
    expect(md).not.toMatch(/\| (yes|no) \|\s*$/im);
  });

  it("writes per quarter: events in window, rows graded, qualifying null (nothing graded), awaiting", async () => {
    const { state, r } = await run();
    expect(state.aiAllowed.window).toEqual(["2026-Q3", "2026-Q4"]);
    expect(state.aiAllowed.quarters).toEqual([
      { quarter: "2026-Q3", position: "current", eventsInWindow: 1, rowsGraded: 0, qualifying: null, awaiting: 1, unsettled: 0 },
      { quarter: "2026-Q4", position: "next", eventsInWindow: 8, rowsGraded: 0, qualifying: null, awaiting: 8, unsettled: 0 },
    ]);
    expect(state.aiAllowed.kill).toEqual({ fired: null, quarters: [] });
    expect(state.aiAllowed.table).toBe("research/measurements/ai-allowed-events.md");
    expect(state.aiAllowed.urlsFile).toBe("research/measurements/ai-allowed-events.urls.txt");
    expect(state.aiAllowed.keptOutsideWindow).toBe(0);
    expect(state.aiAllowed.untabled).toBe(0);
    expect(state.aiAllowed.relisted).toBe(0);
    expect(state.aiAllowed.sameEvent).toBe(0);
    // The list-count half is unchanged beside it.
    expect(state).toMatchObject(summarisePrizeIntake(FIXTURE_TEXT, MEASURED));
    expect(r.message).toMatch(/Rules pages: 0 of 9 rows in the window graded; 21 URLs await a render/);
  });

  it("writes the awaiting URLs in render-watch's urls syntax, every one verbatim from the list and the table", async () => {
    const { urls, md, state } = await run();
    const entries = parseUrlList(urls) as { url: string; slug: string }[];
    // 9 event URLs + 12 other URLs the list gives (flagos 2, ansperformance 8, RealPDE 2); all distinct.
    expect(entries).toHaveLength(21);
    expect(state.aiAllowed.urlsAwaiting).toBe(21);
    expect(entries.map((e) => e.url)).toContain(ARC);
    for (const e of entries) {
      expect(md).toContain(`<${e.url}>`);
      expect(e.slug).toMatch(/^prize-[a-z0-9-]*[a-z0-9]-[0-9a-f]{8}$/);
      expect(e.slug).toBe(renderSlug(e.url));
    }
    expect(urls).toMatch(/^# 2026-Q4 · 2026-11-02 · ARC Prize 2026 - ARC-AGI-2$/m);
    expect(urls).toContain(`${ARC}\t${renderSlug(ARC)}`);
  });

  it("never touches research/rendered/urls.txt", async () => {
    const standing = join(root, "research", "rendered", "urls.txt");
    mkdirSync(dirname(standing), { recursive: true });
    writeFileSync(standing, "# the standing list\nhttps://example.org/\texample\n");
    await run();
    expect(readFileSync(standing, "utf8")).toBe("# the standing list\nhttps://example.org/\texample\n");
  });
});

describe("renderSlug and the tiktok.com refusal", () => {
  it("gives each URL a stable slug render-watch accepts, in its own prize- namespace", () => {
    const a = renderSlug(ARC);
    expect(a).toBe(renderSlug(ARC));
    expect(a).not.toBe(renderSlug(`${ARC}&x=1`));
    expect(a.length).toBeLessThanOrEqual(80);
    expect(() => parseUrlList(`${ARC}\t${a}\n`)).not.toThrow();
  });

  it("refuses tiktok.com and its subdomains, and nothing else", () => {
    for (const u of ["https://www.tiktok.com/@x/video/1", "https://tiktok.com/t/abc", "https://vm.tiktok.com/ZM123/", "HTTPS://WWW.TIKTOK.COM/@y"]) {
      expect(isRefusedForRender(u), u).toBe(true);
    }
    for (const u of [ARC, "https://example.org/?next=tiktok.com", "https://nottiktok.com/"]) expect(isRefusedForRender(u), u).toBe(false);
  });

  it("keeps a tiktok.com event in the table but never in the list for render-watch", () => {
    const events: ListedEvent[] = [
      { name: "Clip contest", deadline: "2026-11-01", prize: "$100", url: "https://www.tiktok.com/@brand/contest", otherUrls: ["https://vm.tiktok.com/ZM1/", "https://example.org/rules"] },
    ];
    const built = buildAiAllowedTable({ ...base(), events });
    expect(parseAiAllowedTable(built.markdown).map((r) => r.url)).toEqual(["https://www.tiktok.com/@brand/contest"]);
    // Not on a URL line, and not in a comment a session could uncomment: only the header's rule names the host.
    const lines = built.urls.split("\n");
    expect(lines.filter((l) => /tiktok/i.test(l))).toEqual([
      "# tiktok.com URLs are refused (logs/CHANNEL_LOOP.md §9: no tiktok.com URL in any render list or override): 2 refused.",
    ]);
    expect((parseUrlList(built.urls) as { url: string }[]).map((e) => e.url)).toEqual(["https://example.org/rules"]);
    expect(built.summary.urlsRefused).toBe(2);
    expect(built.summary.urlsAwaiting).toBe(1);
  });
});

/** Inputs for buildAiAllowedTable with the reading's provenance filled in. */
function base(measuredOn = "2026-09-29") {
  return {
    events: listedEventsFrom(FIXTURE_TEXT),
    measuredAt: `${measuredOn}T05:41:00Z`,
    measuredOn,
    source: "https://raw.githubusercontent.com/mlcontests/mlcontests.github.io/master/competitions.json",
    sourceSha256: "0".repeat(64),
    existingMarkdown: null as string | null,
    captureExists: (_rel: string) => true,
  };
}

describe("a session's cells survive every re-run", () => {
  const NO = { clause: '"Automated and AI-assisted solutions must be disclosed." research/rendered/prize-arc-rules.txt:41', grade: "RENDERED", qualifies: "no" };
  const YES = { clause: '"Entries may be built wholly by AI systems; no authorship statement is required." research/rendered/prize-zindi-rules.txt', grade: "RENDERED", qualifies: "yes" };

  it("carries filled cells forward verbatim by the event URL, and counts them", () => {
    const first = buildAiAllowedTable(base());
    let md = fill(first.markdown, ARC, NO);
    md = fill(md, ZINDI, YES);
    const again = buildAiAllowedTable({ ...base("2026-09-30"), existingMarkdown: md });
    const rows = parseAiAllowedTable(again.markdown);
    expect(rows.find((r) => r.url === ARC)).toMatchObject({ clause: NO.clause, grade: "RENDERED", qualifies: "no" });
    expect(rows.find((r) => r.url === ZINDI)).toMatchObject({ clause: YES.clause, grade: "RENDERED", qualifies: "yes" });
    expect(again.markdown).toContain(`| <${ARC}> | — | ${NO.clause} | RENDERED | no |`);
    expect(again.summary.quarters[1]).toEqual({ quarter: "2026-Q4", position: "next", eventsInWindow: 8, rowsGraded: 2, qualifying: 1, awaiting: 6, unsettled: 0 });
    // A graded row's URLs leave the render list; the others stay.
    expect(again.urls).not.toContain(ARC);
    expect(again.urls).not.toContain(ZINDI);
    expect(again.urls).toContain(BIOHUB);
    // A third run changes nothing a session wrote.
    const third = buildAiAllowedTable({ ...base("2026-09-30"), existingMarkdown: again.markdown });
    expect(sessionCells(third.markdown)).toEqual(sessionCells(again.markdown));
    expect(third.markdown).toBe(again.markdown);
  });

  const withPipe = { clause: 'Rules §4: "AI tools \\| any" research/rendered/prize-arc-rules.txt', grade: "RENDERED", qualifies: "no" };
  const changed = (patch: Record<string, unknown>) => listedEventsFrom(listOf(FIXTURE_DATA.map((e) => (e.url === ARC ? { ...e, ...patch } : e))));

  it("keeps a cell holding an escaped pipe, and follows an event whose deadline the list moved (same URL and name)", () => {
    const md = fill(buildAiAllowedTable(base()).markdown, ARC, withPipe);
    const again = buildAiAllowedTable({ ...base("2026-09-30"), events: changed({ deadline: "9 Dec 2026" }), existingMarkdown: md });
    const arc = parseAiAllowedTable(again.markdown).find((r) => r.url === ARC)!;
    expect(arc).toMatchObject({ name: "ARC Prize 2026 - ARC-AGI-2", deadline: "2026-12-09", clause: withPipe.clause, qualifies: "no" });
    expect(again.summary.keptOutsideWindow).toBe(0);
  });

  it("follows an event the list renamed (same URL and deadline)", () => {
    const md = fill(buildAiAllowedTable(base()).markdown, ARC, withPipe);
    const again = buildAiAllowedTable({ ...base("2026-09-30"), events: changed({ name: "ARC Prize 2026 (ARC-AGI-2)" }), existingMarkdown: md });
    const arc = parseAiAllowedTable(again.markdown).find((r) => r.url === ARC)!;
    expect(arc).toMatchObject({ name: "ARC Prize 2026 (ARC-AGI-2)", deadline: "2026-11-02", clause: withPipe.clause, qualifies: "no" });
    expect(again.summary.keptOutsideWindow).toBe(0);
  });

  it("does not follow when the name and the deadline both changed: a different event on the same URL starts ungraded", () => {
    const md = fill(buildAiAllowedTable(base()).markdown, ARC, withPipe);
    const again = buildAiAllowedTable({
      ...base("2026-09-30"),
      events: changed({ name: "ARC Prize 2027 - ARC-AGI-3", deadline: "9 Dec 2026" }),
      existingMarkdown: md,
    });
    const rows = parseAiAllowedTable(again.markdown).filter((r) => r.url === ARC);
    expect(rows.map((r) => [r.name, r.deadline, r.qualifies, r.kept ?? false])).toEqual([
      ["ARC Prize 2027 - ARC-AGI-3", "2026-12-09", "", false],
      ["ARC Prize 2026 - ARC-AGI-2", "2026-11-02", "no", true], // the old reading, kept and counted nowhere
    ]);
    expect(again.summary.keptOutsideWindow).toBe(1);
    expect(again.summary.quarters.find((q) => q.quarter === "2026-Q4")).toMatchObject({ eventsInWindow: 8, rowsGraded: 0, qualifying: null });
  });

  it("drops an unfilled row whose event left the window, and keeps a filled one outside it", () => {
    const md = fill(buildAiAllowedTable(base()).markdown, ARC, NO); // ZINDI stays unfilled
    const gone = listOf(FIXTURE_DATA.filter((e) => e.url !== ARC && e.url !== ZINDI));
    const again = buildAiAllowedTable({ ...base("2026-09-30"), events: listedEventsFrom(gone), existingMarkdown: md });
    expect(again.markdown).not.toContain(ZINDI);
    expect(again.markdown).toMatch(/^## Kept outside the window/m);
    const kept = parseAiAllowedTable(again.markdown).find((r) => r.url === ARC)!;
    expect(kept).toMatchObject({ clause: NO.clause, grade: "RENDERED", qualifies: "no" });
    expect(again.summary.keptOutsideWindow).toBe(1);
    // A kept row is not counted in any quarter: the list no longer places it there.
    expect(again.summary.quarters.find((q) => q.quarter === "2026-Q4")!.eventsInWindow).toBe(6);
  });

  it("never carries a closed quarter's grade to a new event that reuses the URL (a recurring event), nor moves the record", () => {
    // The full list reuses URLs across years (e.g. https://ctf.spylab.ai twice): last year's rules are not this year's.
    const url = "https://example.org/yearly-cup";
    const y1: ListedEvent[] = [{ name: "Yearly cup", deadline: "2026-08-10", prize: "$1,000", url, otherUrls: [] }];
    const md = fill(buildAiAllowedTable({ ...base("2026-08-01"), events: y1 }).markdown, url, NO);
    const y2: ListedEvent[] = [{ name: "Yearly cup", deadline: "2026-11-10", prize: "$1,000", url, otherUrls: [] }];
    const october = buildAiAllowedTable({ ...base("2026-10-07"), events: y2, existingMarkdown: md });
    const rows = parseAiAllowedTable(october.markdown).filter((r) => r.url === url);
    expect(rows.map((r) => [r.deadline, r.qualifies])).toEqual([
      ["2026-11-10", ""], // this year's event: ungraded
      ["2026-08-10", "no"], // last year's record: unchanged
    ]);
    expect(october.summary.quarters.find((q) => q.quarter === "2026-Q3")).toMatchObject({ eventsInWindow: 1, rowsGraded: 1, qualifying: 0 });
    expect(october.urls).toContain(url);
    // Same URL and name as a closed quarter's row: an extension or a new edition — named, never silently counted twice.
    expect(october.summary).toMatchObject({ relisted: 1, sameEvent: 0 });
    expect(october.summary.quarters.find((q) => q.quarter === "2026-Q4")).toMatchObject({ eventsInWindow: 1, awaiting: 1, qualifying: null });
    expect(october.markdown).toMatch(/^## Listed again after a closed quarter$/m);
    expect(october.markdown).toContain(`- 2026-11-10 · Yearly cup (<${url}>): in the record of 2026-Q3 (deadline 2026-08-10). Not decided yet.`);
  });

  it("keeps a kept row kept, in no quarter's count, after its quarter has passed", () => {
    const md = fill(buildAiAllowedTable(base()).markdown, ARC, NO);
    const gone = listOf(FIXTURE_DATA.filter((e) => e.url !== ARC));
    const september = buildAiAllowedTable({ ...base("2026-09-30"), events: listedEventsFrom(gone), existingMarkdown: md });
    expect(september.summary.keptOutsideWindow).toBe(1);
    // ARC's deadline (2 Nov) lies in 2026-Q4; by January that quarter is closed, yet the kept row stays out of its count.
    const january = buildAiAllowedTable({ ...base("2027-01-12"), events: listedEventsFrom(gone), existingMarkdown: september.markdown });
    expect(january.summary.keptOutsideWindow).toBe(1);
    expect(january.summary.quarters.find((q) => q.quarter === "2026-Q4")).toMatchObject({ eventsInWindow: 7, rowsGraded: 0 });
  });

  it("keeps a closed quarter's rows as the record when the quarter rolls over", () => {
    const md = fill(buildAiAllowedTable(base()).markdown, BIOHUB, { ...NO, clause: '"no restriction on tools" research/rendered/prize-biohub-rules.txt' });
    const october = buildAiAllowedTable({ ...base("2026-10-07"), existingMarkdown: md });
    expect(october.summary.window).toEqual(["2026-Q4", "2027-Q1"]);
    expect(october.summary.quarters.map((q) => [q.quarter, q.position])).toEqual([
      ["2026-Q3", "closed"],
      ["2026-Q4", "current"],
      ["2027-Q1", "next"],
    ]);
    expect(october.summary.quarters[0]).toMatchObject({ eventsInWindow: 1, rowsGraded: 1, qualifying: 0, awaiting: 0 });
    expect(october.markdown).toMatch(/^## 2026-Q3 — deadlines 1 Jul – 30 Sep 2026 \(closed; kept as the record\)$/m);
    expect(parseAiAllowedTable(october.markdown).find((r) => r.url === BIOHUB)!.qualifies).toBe("no");
  });
});

/** Replace the session cells of the one row `pick` selects (by its cells: name, deadline, prize, <url>, …). */
function fillWhere(md: string, pick: (cells: string[]) => boolean, cells: [string, string, string]): string {
  let hits = 0;
  const out = md
    .split("\n")
    .map((line) => {
      if (!line.startsWith("| ") || line.startsWith("| Event |") || line.startsWith("| --- |")) return line;
      const parts = line.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim());
      if (parts.length !== 8 || !pick(parts)) return line;
      hits += 1;
      parts.splice(5, 3, ...cells);
      return `| ${parts.join(" | ")} |`;
    })
    .join("\n");
  expect(hits).toBe(1);
  return out;
}

describe("the merge never moves a verdict to another event", () => {
  const U = "https://example.org/cup";
  const YES: [string, string, string] = ['"AI-built entries welcome" research/rendered/prize-cup.txt', "RENDERED", "yes"];
  const NO: [string, string, string] = ['"Human authors only" research/rendered/prize-cup.txt', "RENDERED", "no"];
  const ev = (name: string, deadline: string, url = U): ListedEvent => ({ name, deadline, prize: null, url, otherUrls: [] });
  const at = (day: string, events: ListedEvent[], existingMarkdown: string | null) => buildAiAllowedTable({ ...base(day), events, existingMarkdown });
  const cells = (md: string) => parseAiAllowedTable(md).map((r) => [r.name, r.deadline, r.qualifies, r.kept ?? false]);
  const byName = (name: string) => (p: string[]) => p[0] === name;
  const byDay = (deadline: string) => (p: string[]) => p[1] === deadline;

  it("keeps each of two events that share a URL and a name on its own cells, however the list orders them", () => {
    // Reviewer's case: the list gives them in reverse deadline order; the verdict used to swap on every run.
    const events = [ev("Cup", "2026-12-01"), ev("Cup", "2026-10-05")];
    let md = at("2026-09-29", events, null).markdown;
    md = fillWhere(fillWhere(md, byDay("2026-10-05"), YES), byDay("2026-12-01"), NO);
    const want = [
      ["Cup", "2026-10-05", "yes", false],
      ["Cup", "2026-12-01", "no", false],
    ];
    const second = at("2026-09-30", events, md);
    expect(cells(second.markdown)).toEqual(want);
    const third = at("2026-09-30", [...events].reverse(), second.markdown);
    expect(cells(third.markdown)).toEqual(want);
    expect(third.markdown).toBe(second.markdown);
  });

  it("writes the same table whatever order the list gives its events in", () => {
    const events = listedEventsFrom(FIXTURE_TEXT);
    const md = fill(buildAiAllowedTable(base()).markdown, ARC, { clause: "silent research/rendered/prize-arc.txt", grade: "RENDERED", qualifies: "no" });
    const forward = buildAiAllowedTable({ ...base("2026-09-30"), events, existingMarkdown: md });
    const backward = buildAiAllowedTable({ ...base("2026-09-30"), events: [...events].reverse(), existingMarkdown: md });
    expect(backward.markdown).toBe(forward.markdown);
    expect(backward.urls).toBe(forward.urls);
  });

  it("orders rows that share a deadline and a name by URL, whatever order the list gives them in", () => {
    const pair = [ev("Cup", "2026-11-01", "https://example.org/b"), ev("Cup", "2026-11-01", "https://example.org/a")];
    const one = at("2026-09-29", pair, null);
    const other = at("2026-09-29", [...pair].reverse(), null);
    expect(parseAiAllowedTable(one.markdown).map((r) => r.url)).toEqual(["https://example.org/a", "https://example.org/b"]);
    expect(other.markdown).toBe(one.markdown);
    expect(other.urls).toBe(one.urls);
  });

  it("does not hand a verdict to a new edition that reuses the URL under a new name and deadline", () => {
    let md = at("2026-11-01", [ev("Yearly 2026", "2026-11-20")], null).markdown;
    md = fillWhere(md, byName("Yearly 2026"), YES);
    const built = at("2026-11-25", [ev("Yearly 2027", "2027-02-15")], md);
    expect(cells(built.markdown)).toEqual([
      ["Yearly 2027", "2027-02-15", "", false],
      ["Yearly 2026", "2026-11-20", "yes", true],
    ]);
    expect(built.summary.quarters.find((q) => q.quarter === "2027-Q1")).toMatchObject({ eventsInWindow: 1, rowsGraded: 0, qualifying: null });
    expect(built.summary.keptOutsideWindow).toBe(1);
  });

  it("does not hand a kept row's verdict to a different event that later arrives on its URL", () => {
    let md = at("2026-10-07", [ev("Cup A", "2026-12-10")], null).markdown;
    md = fillWhere(md, byName("Cup A"), YES);
    const gone = at("2026-10-14", [], md);
    expect(gone.summary.keptOutsideWindow).toBe(1);
    const other = at("2026-10-21", [ev("Cup B (different event)", "2027-03-01")], gone.markdown);
    expect(cells(other.markdown)).toEqual([
      ["Cup B (different event)", "2027-03-01", "", false],
      ["Cup A", "2026-12-10", "yes", true],
    ]);
    expect(other.summary.quarters.find((q) => q.quarter === "2027-Q1")!.qualifying).toBeNull();
  });

  it("gives a kept event its cells back when it returns, and empties the kept section", () => {
    let md = at("2026-10-07", [ev("Cup A", "2026-12-10")], null).markdown;
    md = fillWhere(md, byName("Cup A"), YES);
    const gone = at("2026-10-14", [], md);
    expect(gone.markdown).toMatch(/^## Kept outside the window/m);
    for (const back of [ev("Cup A", "2026-12-10"), ev("Cup A", "2026-12-20"), ev("Cup A (renamed)", "2026-12-10")]) {
      const built = at("2026-10-21", [back], gone.markdown);
      expect(cells(built.markdown), back.name + back.deadline).toEqual([[back.name, back.deadline, "yes", false]]);
      expect(built.summary.keptOutsideWindow).toBe(0);
      expect(built.markdown).not.toMatch(/^## Kept outside the window/m);
      expect(built.summary.quarters.find((q) => q.quarter === "2026-Q4")).toMatchObject({ rowsGraded: 1, qualifying: 1 });
    }
  });

  it("tables an event the list gives twice once, so one session's verdict is one verdict", () => {
    const twice = [ev("Cup", "2026-10-05"), { ...ev("Cup", "2026-10-05"), otherUrls: ["https://example.org/cup/rules"] }];
    let md = at("2026-09-29", twice, null).markdown;
    expect(parseAiAllowedTable(md)).toHaveLength(1);
    expect(parseAiAllowedTable(md)[0].otherUrls).toEqual(["https://example.org/cup/rules"]);
    md = fillWhere(md, byName("Cup"), YES);
    const built = at("2026-09-30", twice, md);
    expect(cells(built.markdown)).toEqual([["Cup", "2026-10-05", "yes", false]]);
    expect(built.summary.quarters.find((q) => q.quarter === "2026-Q4")).toMatchObject({ eventsInWindow: 1, rowsGraded: 1, qualifying: 1 });
  });

  it("never copies one row's verdict onto a second event with the same URL and name", () => {
    let md = at("2026-09-29", [ev("Cup", "2026-10-05")], null).markdown;
    md = fillWhere(md, byName("Cup"), YES);
    // The graded event is still listed, and a second one with the same URL and name arrives: it starts ungraded.
    const built = at("2026-09-30", [ev("Cup", "2026-10-05"), ev("Cup", "2026-11-20")], md);
    expect(cells(built.markdown)).toEqual([
      ["Cup", "2026-10-05", "yes", false],
      ["Cup", "2026-11-20", "", false],
    ]);
    expect(built.summary.quarters.find((q) => q.quarter === "2026-Q4")).toMatchObject({ eventsInWindow: 2, rowsGraded: 1, qualifying: 1, awaiting: 1 });
  });

  it("keeps two tracks on one URL and one deadline on their own grades when one leaves and another arrives", () => {
    let md = at("2026-09-29", [ev("Track X", "2026-11-01"), ev("Track Y", "2026-11-01")], null).markdown;
    md = fillWhere(fillWhere(md, byName("Track X"), YES), byName("Track Y"), NO);
    const both = at("2026-09-30", [ev("Track Y", "2026-11-01"), ev("Track X", "2026-11-01")], md);
    expect(cells(both.markdown)).toEqual([
      ["Track X", "2026-11-01", "yes", false],
      ["Track Y", "2026-11-01", "no", false],
    ]);
    // X leaves, Z arrives: Y keeps its own "no". (Z, alone with X's URL and deadline, is read as X renamed.)
    const swapped = at("2026-09-30", [ev("Track Y", "2026-11-01"), ev("Track Z", "2026-11-01")], md);
    expect(parseAiAllowedTable(swapped.markdown).find((r) => r.name === "Track Y")!.qualifies).toBe("no");
  });

  it("keeps an event on its own cells when a same-name event with another deadline leaves and a third arrives", () => {
    let md = at("2026-09-29", [ev("Cup", "2026-10-05"), ev("Cup", "2026-12-01")], null).markdown;
    md = fillWhere(fillWhere(md, byDay("2026-10-05"), YES), byDay("2026-12-01"), NO);
    const built = at("2026-09-30", [ev("Cup", "2026-12-01"), ev("Cup", "2026-12-15")], md);
    expect(parseAiAllowedTable(built.markdown).find((r) => r.deadline === "2026-12-01")!.qualifies).toBe("no");
  });

  it("matches on one changed field only where exactly one row and one event share the rest", () => {
    // Two graded rows, one listed event with the same URL and name but a new deadline: which one moved? Neither inherits.
    let md = at("2026-09-29", [ev("Cup", "2026-10-05"), ev("Cup", "2026-12-01")], null).markdown;
    md = fillWhere(fillWhere(md, byDay("2026-10-05"), YES), byDay("2026-12-01"), NO);
    const oneEvent = at("2026-09-30", [ev("Cup", "2026-11-11")], md);
    expect(cells(oneEvent.markdown)).toEqual([
      ["Cup", "2026-11-11", "", false],
      ["Cup", "2026-10-05", "yes", true],
      ["Cup", "2026-12-01", "no", true],
    ]);
    // One graded row, two listed events with its URL and name, neither on its deadline: neither inherits.
    let one = at("2026-09-29", [ev("Cup", "2026-10-05")], null).markdown;
    one = fillWhere(one, byName("Cup"), YES);
    const twoEvents = at("2026-09-30", [ev("Cup", "2026-10-20"), ev("Cup", "2026-11-11")], one);
    expect(cells(twoEvents.markdown)).toEqual([
      ["Cup", "2026-10-20", "", false],
      ["Cup", "2026-11-11", "", false],
      ["Cup", "2026-10-05", "yes", true],
    ]);
    // The same on the URL and the deadline: two renamed events on one URL inherit nothing, nor does one of two.
    let tracks = at("2026-09-29", [ev("Track X", "2026-11-01"), ev("Track Y", "2026-11-01")], null).markdown;
    tracks = fillWhere(fillWhere(tracks, byName("Track X"), YES), byName("Track Y"), NO);
    const renamedOne = at("2026-09-30", [ev("Track Q", "2026-11-01")], tracks);
    expect(parseAiAllowedTable(renamedOne.markdown).find((r) => r.name === "Track Q")!.qualifies).toBe("");
    const renamedBoth = at("2026-09-30", [ev("Track P", "2026-11-01"), ev("Track Q", "2026-11-01")], tracks);
    expect(parseAiAllowedTable(renamedBoth.markdown).filter((r) => !r.kept).map((r) => r.qualifies)).toEqual(["", ""]);
    let single = at("2026-09-29", [ev("Track X", "2026-11-01")], null).markdown;
    single = fillWhere(single, byName("Track X"), YES);
    const twoRenamed = at("2026-09-30", [ev("Track P", "2026-11-01"), ev("Track Q", "2026-11-01")], single);
    expect(parseAiAllowedTable(twoRenamed.markdown).filter((r) => !r.kept).map((r) => r.qualifies)).toEqual(["", ""]);
    expect(twoRenamed.summary.keptOutsideWindow).toBe(1);
  });
});

describe("listed again after a closed quarter — an extension is never counted twice", () => {
  const U = "https://example.org/extended";
  const NO_CELLS = { clause: "silent research/rendered/prize-ext.txt", grade: "RENDERED", qualifies: "no" };
  const september = () => {
    const md = buildAiAllowedTable({ ...base("2026-09-01"), events: [{ name: "Ext cup", deadline: "2026-09-30", prize: null, url: U, otherUrls: [] }] }).markdown;
    return fill(md, U, NO_CELLS);
  };
  const extended: ListedEvent[] = [{ name: "Ext cup", deadline: "2026-10-14", prize: null, url: U, otherUrls: [] }];
  const october = (md: string) => buildAiAllowedTable({ ...base("2026-10-07"), events: extended, existingMarkdown: md });
  const setGrade = (md: string, grade: string, qualifies = "") =>
    md
      .split("\n")
      .map((l) => (l.startsWith("| Ext cup | 2026-10-14 |") ? l.replace(/\| [^|]* \| [^|]* \| [^|]* \|$/, `| ${grade === "RENDERED" ? NO_CELLS.clause : ""} | ${grade} | ${qualifies} |`) : l))
      .join("\n");

  it("names the row, keeps the closed record, and counts the new row as awaiting until a session decides", () => {
    const built = october(september());
    expect(built.summary).toMatchObject({ relisted: 1, sameEvent: 0 });
    expect(built.summary.quarters.map((q) => [q.quarter, q.eventsInWindow, q.rowsGraded, q.awaiting])).toEqual([
      ["2026-Q3", 1, 1, 0],
      ["2026-Q4", 1, 0, 1],
      ["2027-Q1", 0, 0, 0],
    ]);
    expect(built.markdown).toContain("1 row in the window has the URL and name of a row in a closed quarter's record (0 graded SAME EVENT)");
  });

  it("counts a row graded SAME EVENT only in the closed quarter, and stops asking for its render — also once its own quarter closes", () => {
    const md = setGrade(october(september()).markdown, "SAME EVENT");
    const built = october(md);
    expect(built.summary).toMatchObject({ relisted: 1, sameEvent: 1 });
    expect(built.summary.quarters.find((q) => q.quarter === "2026-Q4")).toMatchObject({ eventsInWindow: 0, rowsGraded: 0, awaiting: 0, unsettled: 0, qualifying: null });
    expect(built.summary.quarters.find((q) => q.quarter === "2026-Q3")).toMatchObject({ eventsInWindow: 1, rowsGraded: 1, qualifying: 0 });
    expect(built.urls).not.toContain(U);
    expect(built.markdown).toContain("Graded SAME EVENT: counted in the closed quarter only.");
    expect(parseAiAllowedTable(built.markdown).find((r) => r.deadline === "2026-10-14")!.grade).toBe("SAME EVENT");
    // In January 2026-Q4 is closed too: the SAME EVENT row stays out of its count, so the quarter is not held open by it.
    const january = buildAiAllowedTable({ ...base("2027-01-12"), events: [], existingMarkdown: built.markdown });
    expect(january.summary.quarters.find((q) => q.quarter === "2026-Q4")).toMatchObject({ position: "closed", eventsInWindow: 0, unsettled: 0 });
    expect(january.summary.quarters.find((q) => q.quarter === "2026-Q3")).toMatchObject({ eventsInWindow: 1, rowsGraded: 1 });
  });

  it("counts a row graded as usual as a new edition, in its own quarter", () => {
    const built = october(setGrade(october(september()).markdown, "RENDERED", "no"));
    expect(built.summary).toMatchObject({ relisted: 1, sameEvent: 0 });
    expect(built.summary.quarters.find((q) => q.quarter === "2026-Q4")).toMatchObject({ eventsInWindow: 1, rowsGraded: 1, qualifying: 0 });
    expect(built.markdown).toContain("Graded as a new edition: counted in its own quarter.");
  });

  it("lists a row again only for a closed row with its URL and its name, and only an earlier one", () => {
    // Another name on the closed row's URL is another event (a track, a new title): not listed again.
    const renamed: ListedEvent[] = [{ name: "Ext cup 2", deadline: "2026-10-14", prize: null, url: U, otherUrls: [] }];
    const other = buildAiAllowedTable({ ...base("2026-10-07"), events: renamed, existingMarkdown: september() });
    expect(other.summary.relisted).toBe(0);
    expect(other.markdown).not.toMatch(/^## Listed again after a closed quarter$/m);
    // In January both quarters are closed. The Q4 row's twin is the earlier Q3 row; the Q3 row has no earlier twin,
    // so a SAME EVENT written on it (it can only be the same as an earlier event) is not settled.
    const q4 = setGrade(october(september()).markdown, "RENDERED", "no");
    const q3same = q4
      .split("\n")
      .map((l) => (l.startsWith("| Ext cup | 2026-09-30 |") ? l.replace("| silent research/rendered/prize-ext.txt | RENDERED | no |", "|  | SAME EVENT |  |") : l))
      .join("\n");
    expect(q3same).not.toBe(q4);
    const january = buildAiAllowedTable({ ...base("2027-01-12"), events: [], existingMarkdown: q3same });
    expect(january.summary.quarters.find((q) => q.quarter === "2026-Q3")).toMatchObject({ position: "closed", eventsInWindow: 1, unsettled: 1 });
    expect(january.summary.quarters.find((q) => q.quarter === "2026-Q4")).toMatchObject({ position: "closed", eventsInWindow: 1, rowsGraded: 1 });
  });

  it("does not settle SAME EVENT on a row with no closed twin, nor with a verdict beside it", () => {
    const lone = fill(buildAiAllowedTable(base()).markdown, ARC, { clause: "", grade: "SAME EVENT", qualifies: "" });
    const a = buildAiAllowedTable({ ...base(), existingMarkdown: lone });
    expect(a.summary.quarters.find((q) => q.quarter === "2026-Q4")).toMatchObject({ eventsInWindow: 8, unsettled: 1 });
    expect(a.markdown).toContain("the grade says SAME EVENT, but no row of an earlier, closed quarter has this URL and name");
    const withVerdict = october(setGrade(october(september()).markdown, "SAME EVENT", "yes"));
    expect(withVerdict.summary.quarters.find((q) => q.quarter === "2026-Q4")).toMatchObject({ eventsInWindow: 1, unsettled: 1 });
    expect(withVerdict.markdown).toContain("a SAME EVENT row leaves the qualifies cell empty");
  });
});

describe("the job never writes yes", () => {
  it("leaves every verdict empty even when the list's own words say AI is allowed", () => {
    const loud = FIXTURE_DATA.map((e, i) =>
      i === 0 ? { ...e, name: "AI-generated entries allowed: yes", note: "AI allowed, no human authorship needed", tags: ["llm", "agents"] } : e,
    );
    const built = buildAiAllowedTable({ ...base(), events: listedEventsFrom(listOf(loud)) });
    expect(parseAiAllowedTable(built.markdown).every((r) => r.qualifies === "" && r.grade === "" && r.clause === "")).toBe(true);
    expect(built.summary.quarters.every((q) => q.qualifying === null)).toBe(true);
  });

  it("writes no verdict a session did not write: the set of verdicts out equals the set in", () => {
    const md = fill(buildAiAllowedTable(base()).markdown, ARC, { clause: "silent research/rendered/prize-arc-rules.txt", grade: "RENDERED", qualifies: "no" });
    for (const day of ["2026-09-30", "2026-10-07", "2026-12-31"]) {
      const out = buildAiAllowedTable({ ...base(day), existingMarkdown: md });
      const verdicts = parseAiAllowedTable(out.markdown).map((r) => r.qualifies).filter(Boolean);
      expect(verdicts, day).toEqual(["no"]);
    }
  });
});

describe("qualifying stays null until a row is graded — never inferred", () => {
  it("does not count a row a session started but did not settle", () => {
    const exists = (rel: string) => rel !== "research/rendered/prize-missing.txt";
    let md = buildAiAllowedTable(base()).markdown;
    md = fill(md, ARC, { clause: '"AI welcome"', grade: "RENDERED", qualifies: "yes" }); // no capture pointer
    md = fill(md, ZINDI, { clause: '"AI welcome" research/rendered/prize-missing.txt', grade: "RENDERED", qualifies: "yes" }); // pointer to nothing
    md = fill(md, ANSP, { clause: '"AI welcome" research/rendered/prize-ansp.txt', grade: "SNIPPET", qualifies: "yes" }); // not read from a capture
    md = fill(md, BIOHUB, { clause: "research/rendered/prize-biohub.txt", grade: "RENDERED", qualifies: "maybe" });
    const built = buildAiAllowedTable({ ...base(), existingMarkdown: md, captureExists: exists });
    expect(built.summary.quarters).toEqual([
      { quarter: "2026-Q3", position: "current", eventsInWindow: 1, rowsGraded: 0, qualifying: null, awaiting: 0, unsettled: 1 },
      { quarter: "2026-Q4", position: "next", eventsInWindow: 8, rowsGraded: 0, qualifying: null, awaiting: 5, unsettled: 3 },
    ]);
    expect(built.markdown).toMatch(/^## Rows a session started but did not settle$/m);
    expect(built.markdown).toContain("the clause cell names no capture under research/rendered/");
    expect(built.markdown).toContain("a capture pointer names no file in research/rendered/");
    expect(built.markdown).toContain("the grade is not RENDERED");
    expect(built.markdown).toContain("the qualifies cell is neither yes nor no");
    // The unsettled rows' URLs stay in the render list.
    expect(built.urls).toContain(ARC);
  });

  it("counts a graded no as a real zero, not null", () => {
    const md = fill(buildAiAllowedTable(base()).markdown, BIOHUB, { clause: "silent on AI: research/rendered/prize-biohub.txt.", grade: "[RENDERED]", qualifies: "No" });
    const built = buildAiAllowedTable({ ...base(), existingMarkdown: md });
    expect(built.summary.quarters[0]).toMatchObject({ quarter: "2026-Q3", rowsGraded: 1, qualifying: 0, awaiting: 0 });
    expect(built.summary.quarters[1].qualifying).toBeNull();
  });

  it("rowState reads the three cells and nothing else", () => {
    const row = { name: "x", deadline: "2026-11-02", prize: "—", url: ARC, otherUrls: [], clause: "", grade: "", qualifies: "" };
    const all = () => true;
    expect(rowState(row, all)).toEqual({ state: "awaiting" });
    expect(rowState({ ...row, clause: "q research/rendered/a.txt", grade: "RENDERED", qualifies: "yes" }, all)).toEqual({ state: "graded", qualifies: true });
    expect(rowState({ ...row, clause: "q research/rendered/a.txt", grade: "RENDERED", qualifies: "YES " }, all)).toEqual({ state: "graded", qualifies: true });
    expect(rowState({ ...row, qualifies: "yes" }, all).state).toBe("unsettled");
    expect(rowState({ ...row, clause: "q research/rendered/../../etc/passwd", grade: "RENDERED", qualifies: "no" }, all).state).toBe("unsettled");
  });

  it("accepts only a render-watch capture as the pointer: a capture file with its .meta.json, never urls.txt, README.md or a meta", () => {
    const row = { name: "x", deadline: "2026-11-02", prize: "—", url: ARC, otherUrls: [], clause: "", grade: "RENDERED", qualifies: "yes" };
    // What research/rendered/ really holds: captures with their metas, the render list, the README, a capture's meta.
    const onDisk = new Set(
      ["urls.txt", "README.md", "prize-arc.txt", "prize-arc.html", "prize-arc.meta.json", "prize-api.json", "prize-api.meta.json", "hand-notes.txt"].map(
        (f) => `research/rendered/${f}`,
      ),
    );
    const exists = (rel: string) => onDisk.has(rel);
    const at = (clause: string) => rowState({ ...row, clause }, exists);
    expect(at('"AI welcome" research/rendered/prize-arc.txt:12')).toEqual({ state: "graded", qualifies: true });
    expect(at('"AI welcome" research/rendered/prize-arc.html')).toEqual({ state: "graded", qualifies: true });
    expect(at('"AI welcome" research/rendered/prize-api.json')).toEqual({ state: "graded", qualifies: true });
    for (const clause of [
      "silent, see research/rendered/urls.txt",
      "see research/rendered/README.md",
      "research/rendered/prize-arc.meta.json",
      "research/rendered/prize-arc.txt and research/rendered/urls.txt",
    ]) {
      const s = at(clause);
      expect(s.state, clause).toBe("unsettled");
      expect(s.state === "unsettled" && s.reasons.join("; "), clause).toContain("is not a render-watch capture");
    }
    // A file there that render-watch did not write: no <slug>.meta.json beside it.
    const handNotes = at("research/rendered/hand-notes.txt");
    expect(handNotes.state === "unsettled" && handNotes.reasons).toEqual([
      "a capture pointer names a file with no <slug>.meta.json beside it, so render-watch did not capture it",
    ]);
    const missing = at("research/rendered/prize-gone.txt");
    expect(missing.state === "unsettled" && missing.reasons).toEqual(["a capture pointer names no file in research/rendered/"]);
  });

  it("does not count a row that cites research/rendered/urls.txt, end to end through the run", async () => {
    const root = mkdtempSync(join(tmpdir(), "prize-rules-pointer-"));
    try {
      const rendered = join(root, "research", "rendered");
      mkdirSync(rendered, { recursive: true });
      writeFileSync(join(rendered, "urls.txt"), "# the standing list\n");
      writeFileSync(join(rendered, "prize-biohub.txt"), "rules text\n");
      writeFileSync(join(rendered, "prize-biohub.meta.json"), "{}\n");
      const first = await runPrizeIntake({ root, nowIso: MEASURED, fetchImpl: fakeFetch(FIXTURE_TEXT) });
      expect(first.code, first.message).toBe(0);
      const table = join(root, AI_ALLOWED_TABLE_FILE);
      let md = readFileSync(table, "utf8");
      md = fill(md, ARC, { clause: '"AI welcome" research/rendered/urls.txt', grade: "RENDERED", qualifies: "yes" });
      md = fill(md, BIOHUB, { clause: '"AI welcome" research/rendered/prize-biohub.txt', grade: "RENDERED", qualifies: "yes" });
      writeFileSync(table, md);
      const second = await runPrizeIntake({ root, nowIso: MEASURED, fetchImpl: fakeFetch(FIXTURE_TEXT) });
      expect(second.code, second.message).toBe(0);
      const state = JSON.parse(readFileSync(join(root, PRIZE_INTAKE_FILE), "utf8"));
      expect(state.aiAllowed.quarters).toEqual([
        { quarter: "2026-Q3", position: "current", eventsInWindow: 1, rowsGraded: 1, qualifying: 1, awaiting: 0, unsettled: 0 },
        { quarter: "2026-Q4", position: "next", eventsInWindow: 8, rowsGraded: 0, qualifying: null, awaiting: 7, unsettled: 1 },
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("a table the job cannot read back is never overwritten", () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "prize-rules-bad-"));
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it("writes nothing and exits 1 when a row lost a cell, the header moved, or a key is not a URL", async () => {
    const good = buildAiAllowedTable(base()).markdown;
    const graded = fill(good, ARC, { clause: "silent research/rendered/prize-arc.txt", grade: "RENDERED", qualifies: "no" });
    const arcRow = `| <${ARC}> | — | silent research/rendered/prize-arc.txt | RENDERED | no |`;
    expect(graded).toContain(arcRow);
    const broken = [
      good.replace(`| <${ARC}> |`, `| ${ARC} |`), // key not in <...>
      good.replace(/\| ARC Prize 2026 - ARC-AGI-2 \| /, "| "), // a cell short (the name)
      graded.replace(arcRow, `| <${ARC}> | — | silent research/rendered/prize-arc.txt | RENDERED |`), // only the Qualifies cell lost
      graded.replace(arcRow, `${arcRow} extra |`), // a cell too many
      good.replace("| Grade |", "| Verdict |"), // header moved
      good.replace("| 2026-11-02 |", "| 2 Nov 2026 |"), // deadline not ISO
    ];
    expect(new Set(broken).size).toBe(broken.length);
    for (const md of broken) expect(md).not.toBe(good);
    for (const md of broken) {
      const table = join(root, AI_ALLOWED_TABLE_FILE);
      mkdirSync(dirname(table), { recursive: true });
      writeFileSync(table, md);
      const r = await runPrizeIntake({ root, nowIso: MEASURED, fetchImpl: fakeFetch(FIXTURE_TEXT) });
      expect(r.code).toBe(1);
      expect(r.message).toMatch(/ai-allowed-events\.md cannot be read back \(line \d+.*\); it holds a reading session's cells, so it is not overwritten.*Nothing was written/s);
      expect(readFileSync(table, "utf8")).toBe(md);
      expect(existsSync(join(root, PRIZE_INTAKE_FILE))).toBe(false);
      expect(existsSync(join(root, AI_ALLOWED_URLS_FILE))).toBe(false);
      expect(r.message).not.toContain("ARC Prize");
    }
  });
});

describe("the kill — two consecutive closed, fully graded quarters under 3", () => {
  const q = (quarter: string, position: AiAllowedQuarter["position"], events: number, graded: number, qualifying: number | null): AiAllowedQuarter => ({
    quarter,
    position,
    eventsInWindow: events,
    rowsGraded: graded,
    qualifying,
    awaiting: events - graded,
    unsettled: 0,
  });

  it("is not computable without two consecutive closed quarters whose every row is graded", () => {
    expect(computeKill([q("2026-Q3", "current", 5, 5, 0), q("2026-Q4", "next", 5, 5, 0)])).toEqual({ fired: null, quarters: [] });
    expect(computeKill([q("2026-Q1", "closed", 4, 4, 2), q("2026-Q2", "closed", 9, 8, 1), q("2026-Q3", "current", 1, 0, null)])).toEqual({ fired: null, quarters: [] });
    expect(computeKill([q("2026-Q1", "closed", 4, 4, 0), q("2026-Q3", "closed", 4, 4, 0), q("2026-Q4", "current", 1, 0, null)])).toEqual({ fired: null, quarters: [] });
    expect(computeKill([q("2026-Q1", "closed", 0, 0, null), q("2026-Q2", "closed", 3, 3, 0), q("2026-Q3", "current", 0, 0, null)])).toEqual({ fired: null, quarters: [] });
  });

  it("fires on two consecutive fully graded quarters under 3, and not when one reached 3", () => {
    expect(computeKill([q("2026-Q1", "closed", 4, 4, 2), q("2026-Q2", "closed", 6, 6, 0), q("2026-Q3", "current", 1, 0, null)])).toEqual({
      fired: true,
      quarters: ["2026-Q1", "2026-Q2"],
    });
    expect(computeKill([q("2026-Q1", "closed", 4, 4, 2), q("2026-Q2", "closed", 6, 6, 3), q("2026-Q3", "current", 1, 0, null)])).toEqual({ fired: false, quarters: [] });
    expect(computeKill([q("2025-Q4", "closed", 4, 4, 1), q("2026-Q1", "closed", 4, 4, 2), q("2026-Q2", "current", 1, 0, null)])).toEqual({
      fired: true,
      quarters: ["2025-Q4", "2026-Q1"],
    });
  });

  it("fires end to end from a table whose two closed quarters were graded by a session", () => {
    // Quarter by quarter, as the weekly job would have met them: Q1 then Q2 of 2026, each graded "no" throughout.
    const early: ListedEvent[] = [
      { name: "Winter cup", deadline: "2026-02-10", prize: "$1,000", url: "https://example.org/winter", otherUrls: [] },
      { name: "Spring cup", deadline: "2026-05-10", prize: "$2,000", url: "https://example.org/spring", otherUrls: [] },
    ];
    const graded = { clause: "silent research/rendered/prize-cup.txt", grade: "RENDERED", qualifies: "no" };
    let md = buildAiAllowedTable({ ...base("2026-01-15"), events: early }).markdown;
    md = fill(fill(md, "https://example.org/winter", graded), "https://example.org/spring", graded);
    const april = buildAiAllowedTable({ ...base("2026-04-15"), events: early, existingMarkdown: md });
    expect(april.summary.kill).toEqual({ fired: null, quarters: [] }); // only Q1 closed
    const july = buildAiAllowedTable({ ...base("2026-07-15"), events: [], existingMarkdown: april.markdown });
    expect(july.summary.kill).toEqual({ fired: true, quarters: ["2026-Q1", "2026-Q2"] });
    expect(july.markdown).toMatch(/Kill: MET — 2026-Q1 and 2026-Q2/);
  });
});

describe("readPrizeIntake — the report line carries the quarters", () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "prize-rules-read-"));
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));
  const file = () => join(root, PRIZE_INTAKE_FILE);
  const reading = async () => {
    await runPrizeIntake({ root, nowIso: MEASURED, fetchImpl: fakeFetch(FIXTURE_TEXT) });
    return JSON.parse(readFileSync(file(), "utf8"));
  };

  it("names each quarter's events, graded rows, qualifying count and awaiting rows, and says the job grades nothing", async () => {
    await reading();
    const r = readPrizeIntake(file(), T0);
    expect(r.status).toBe("read");
    expect(r.line).toContain(
      " Rules pages (research/measurements/ai-allowed-events.md, graded by a reading session, never by the job): " +
        "2026-Q3 (current): 1 event, 0 graded, qualifying not counted (no row graded), 1 awaiting a reading; " +
        "2026-Q4 (next): 8 events, 0 graded, qualifying not counted (no row graded), 8 awaiting a reading. " +
        "21 URLs await a render (research/measurements/ai-allowed-events.urls.txt, for render-watch's urls input). " +
        "Kill (two consecutive closed, fully graded quarters under 3 qualifying): not computable yet.",
    );
    expect(r.line).not.toMatch(/Partly built/);
  });

  it("says a floor, not a count, while a quarter is partly graded", async () => {
    const d = await reading();
    d.aiAllowed.quarters[1] = { ...d.aiAllowed.quarters[1], rowsGraded: 2, qualifying: 1, awaiting: 6 };
    writeFileSync(file(), JSON.stringify(d));
    expect(readPrizeIntake(file(), T0).line).toContain("2026-Q4 (next): 8 events, 2 graded, at least 1 qualifying (6 not yet graded), 6 awaiting a reading.");
  });

  it("reads a reading from before the table existed, and says the table is not in it", () => {
    mkdirSync(dirname(file()), { recursive: true });
    writeFileSync(file(), JSON.stringify(summarisePrizeIntake(FIXTURE_TEXT, MEASURED)));
    const r = readPrizeIntake(file(), T0);
    expect(r.status).toBe("read");
    expect(r.line).toContain(" Rules pages (BOARD-LOOP §13): not in this reading — the weekly job writes research/measurements/ai-allowed-events.md from its next run.");
  });

  it("refuses a quarter count the table could not have produced", async () => {
    const d = await reading();
    const bad: ((x: any) => void)[] = [
      (x) => (x.aiAllowed.quarters[0].qualifying = 0), // a zero with no row graded: inferred
      (x) => Object.assign(x.aiAllowed.quarters[1], { rowsGraded: 1, awaiting: 7, qualifying: 2 }), // more qualifying than graded
      (x) => Object.assign(x.aiAllowed.quarters[1], { rowsGraded: 1, awaiting: 7, qualifying: null }), // graded, yet null
      (x) => (x.aiAllowed.quarters[1].awaiting = 7), // the rows do not add up to the events
      (x) => (x.aiAllowed.kill = { fired: true, quarters: ["2026-Q3", "2026-Q4"] }), // a kill the quarters do not support
      (x) => (x.aiAllowed.quarters[0].position = "closed"),
      (x) => (x.aiAllowed.window = ["2026-Q4", "2027-Q1"]),
      (x) => (x.aiAllowed.urlsAwaiting = -1),
      (x) => (x.aiAllowed.relisted = -1),
      (x) => delete x.aiAllowed.sameEvent,
      (x) => Object.assign(x.aiAllowed, { relisted: 1, sameEvent: 2 }), // more SAME EVENT rows than rows listed again
      (x) => (x.aiAllowed = "yes"),
    ];
    for (const mutate of bad) {
      const copy = structuredClone(d);
      mutate(copy);
      writeFileSync(file(), JSON.stringify(copy));
      const r = readPrizeIntake(file(), T0);
      expect(r.status, mutate.toString()).toBe("invalid");
    }
  });

  it("names the kill when it is met", async () => {
    const d = await reading();
    d.aiAllowed.window = ["2026-Q3", "2026-Q4"];
    d.aiAllowed.quarters = [
      { quarter: "2026-Q1", position: "closed", eventsInWindow: 4, rowsGraded: 4, qualifying: 1, awaiting: 0, unsettled: 0 },
      { quarter: "2026-Q2", position: "closed", eventsInWindow: 5, rowsGraded: 5, qualifying: 2, awaiting: 0, unsettled: 0 },
      ...d.aiAllowed.quarters,
    ];
    d.aiAllowed.kill = { fired: true, quarters: ["2026-Q1", "2026-Q2"] };
    writeFileSync(file(), JSON.stringify(d));
    const r = readPrizeIntake(file(), T0);
    expect(r.status).toBe("read");
    expect(r.line).toContain("2026-Q1 (closed): 4 events, 4 graded, 1 qualifying");
    expect(r.line).toContain(
      "Kill (two consecutive closed, fully graded quarters under 3 qualifying): MET — 2026-Q1 and 2026-Q2; BOARD-LOOP §13 stops this instrument and records the Devpost deferral as closed on evidence.",
    );
  });
});

describe("the tick carries the quarters into the report", () => {
  let db: BetterSqlite3.Database;
  let root: string;
  beforeEach(() => {
    db = createInMemoryDb();
    root = mkdtempSync(join(tmpdir(), "prize-rules-tick-"));
  });
  afterEach(() => {
    db.close();
    rmSync(root, { recursive: true, force: true });
  });

  it("prints one prize-intake line with the per-quarter counts, and never a blocker", async () => {
    await runPrizeIntake({ root, nowIso: MEASURED, fetchImpl: fakeFetch(FIXTURE_TEXT) });
    const result = await tick(db, { nowIso: MEASURED, prizeIntakeFile: join(root, PRIZE_INTAKE_FILE), brandMailFile: join(root, "none.json"), measurementsDir: root });
    const report = renderReport(db, result);
    const thisTick = report.split("## This tick")[1].split("\n## ")[0];
    expect(thisTick.match(/^- Prize-event intake/gm)).toHaveLength(1);
    expect(thisTick).toContain("2026-Q4 (next): 8 events, 0 graded, qualifying not counted (no row graded), 8 awaiting a reading.");
    expect(result.blockers.join("\n")).not.toMatch(/prize/i);
  });
});
