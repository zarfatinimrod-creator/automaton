/**
 * CHANNEL_LOOP.md §4 row 13 — the AI-allowed prize-event intake, an INSTRUMENT ONLY: a weekly ₪0 read of the
 * mlcontests list (competitions.json on GitHub) into numbers in state/colony/prize-intake.json, and one line of the
 * colony report. It files nothing, opens no account and spends nothing.
 *
 * The fixture is 14 real entries of the 397 read on 29.9.2026, copied verbatim (see its .meta.json). The list carries
 * no field that says whether AI or automated solutions are allowed, so the reader never counts that: it says so.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import {
  KNOWN_FIELDS,
  PRIZE_INTAKE_FILE,
  PRIZE_INTAKE_SOURCE,
  PRIZE_INTAKE_STALE_DAYS,
  PrizeIntakeError,
  parseListDate,
  parseStatedUsd,
  readPrizeIntake,
  runPrizeIntake,
  summarisePrizeIntake,
} from "../../revenue/prize-intake.js";
import { renderReport, tick } from "../../revenue/runner.js";

const FIXTURES = resolve(dirname(fileURLToPath(import.meta.url)), "..", "fixtures");
const FIXTURE_TEXT = readFileSync(join(FIXTURES, "mlcontests-competitions-trimmed.json"), "utf8");
const FIXTURE_META = JSON.parse(readFileSync(join(FIXTURES, "mlcontests-competitions-trimmed.meta.json"), "utf8"));
const MEASURED = "2026-09-29T05:41:00Z";
const T0 = Date.parse(MEASURED);
const DAY = 86_400_000;

const listOf = (...entries: Record<string, unknown>[]) => JSON.stringify({ data: entries });
const entry = (over: Record<string, unknown> = {}) => ({
  name: "A",
  url: "https://example.org/a",
  tags: ["measurable"],
  deadline: "31 Dec 2026",
  launched: "1 Sep 2026",
  prize: "$1,000",
  platform: "Kaggle",
  sponsor: "S",
  ...over,
});

describe("parseListDate — the list's 'D Mon YYYY' dates, and nothing looser", () => {
  it("reads one- and two-digit days, short and long month names, to a calendar date", () => {
    expect(parseListDate("2 Nov 2026")).toBe("2026-11-02");
    expect(parseListDate("07 Dec 2026")).toBe("2026-12-07");
    expect(parseListDate("29 Sep 2026")).toBe("2026-09-29");
    expect(parseListDate("1 September 2026")).toBe("2026-09-01");
    expect(parseListDate(" 5 Jan 2026 ")).toBe("2026-01-05");
  });

  it("refuses what it cannot read exactly: the list's one malformed deadline, impossible days, other shapes", () => {
    for (const bad of ["11 May 2026 Apr 2026", "31 Feb 2026", "0 Jan 2026", "2026-11-02", "Nov 2 2026", "TBC", "", null, undefined, 20261102]) {
      expect(parseListDate(bad), String(bad)).toBeNull();
    }
  });
});

describe("parseStatedUsd — a dollar amount the list states, never a guess", () => {
  it("reads '$14,925' and '$850,000'", () => {
    expect(parseStatedUsd("$14,925")).toBe(14925);
    expect(parseStatedUsd("$850,000")).toBe(850000);
    expect(parseStatedUsd("$500")).toBe(500);
  });

  it("does not read a missing prize, another currency, a range or prose as dollars", () => {
    for (const bad of [null, undefined, "", "€10,000", "$10k", "Up to $5,000", "$1,00", "$0", "GPU credits"]) {
      expect(parseStatedUsd(bad), String(bad)).toBeNull();
    }
  });
});

describe("summarisePrizeIntake — the fixture, counted", () => {
  const m = summarisePrizeIntake(FIXTURE_TEXT, MEASURED);

  it("counts open competitions by deadline on or after the reading's UTC day", () => {
    expect(m.measuredAt).toBe(MEASURED);
    expect(m.measuredOn).toBe("2026-09-29");
    expect(m.listed).toBe(14);
    expect(m.undatable).toBe(1); // "11 May 2026 Apr 2026" — neither open nor closed
    expect(m.open).toBe(9); // includes the entry whose deadline is the reading day itself
  });

  it("counts, among the open ones, only what the list states: registration closed, not yet launched, a USD prize, a note", () => {
    expect(m.openRegistrationClosed).toBe(2);
    expect(m.openNotYetLaunched).toBe(0);
    expect(m.openWithStatedUsdPrize).toBe(7);
    expect(m.openStatedUsdPrizeTotal).toBe(14925 + 5800 + 52000 + 7500 + 700000 + 60000 + 21000);
    expect(m.openPrizeUnparsed).toBe(0);
    expect(m.openLaunchedUnparsed).toBe(0);
    expect(m.openRegistrationDeadlineUnparsed).toBe(0);
    expect(m.openWithNote).toBe(0);
    expect(m.unknownFields).toBe(0);
  });

  it("records that the list has no AI-rule field, and leaves both AI counts null — unmeasured, never zero", () => {
    expect(m.aiRuleFieldInSource).toBe(false);
    expect(m.openAiAllowedStated).toBeNull();
    expect(m.openAiNotForbiddenStated).toBeNull();
    for (const field of KNOWN_FIELDS) expect(field).not.toMatch(/\bai\b|automat|human|tool|policy|rule|allow/i);
  });

  it("identifies the bytes it read, and carries numbers only — no competition's name, URL, sponsor or note", () => {
    expect(m.source).toBe(PRIZE_INTAKE_SOURCE);
    expect(m.sourceBytes).toBe(Buffer.byteLength(FIXTURE_TEXT));
    expect(m.sourceSha256).toMatch(/^[0-9a-f]{64}$/);
    const text = JSON.stringify(m);
    const data = JSON.parse(FIXTURE_TEXT).data as { name: string; sponsor: string; url: string }[];
    for (const e of data) {
      expect(text).not.toContain(e.name);
      expect(text).not.toContain(e.url);
    }
    for (const [k, v] of Object.entries(m)) {
      if (["measuredAt", "measuredOn", "source", "sourceSha256"].includes(k)) continue;
      expect(v === null || typeof v === "number" || typeof v === "boolean", k).toBe(true);
    }
  });

  it("treats the deadline day as inclusive: the next day the same list has one fewer open", () => {
    expect(summarisePrizeIntake(FIXTURE_TEXT, "2026-09-30T00:00:00Z").open).toBe(8);
  });

  it("knows every field the full list carried on 29.9.2026", () => {
    expect([...KNOWN_FIELDS].sort()).toEqual([...FIXTURE_META.fieldsSeen].sort());
  });

  it("names the source the loop row names", () => {
    expect(PRIZE_INTAKE_SOURCE).toBe("https://raw.githubusercontent.com/mlcontests/mlcontests.github.io/master/competitions.json");
    expect(FIXTURE_META.url).toBe(PRIZE_INTAKE_SOURCE);
  });
});

describe("summarisePrizeIntake — the cases the fixture does not hold", () => {
  it("counts a field it does not know without reading its values, and then calls the AI rule unknown, not absent", () => {
    const m = summarisePrizeIntake(listOf(entry({ ai_allowed: true, "human-only": "no" }), entry()), MEASURED);
    expect(m.unknownFields).toBe(2);
    // A key this reader does not read may state an AI rule: unknown (null), never "the list has none" (false).
    expect(m.aiRuleFieldInSource).toBeNull();
    expect(m.openAiAllowedStated).toBeNull();
    expect(m.openAiNotForbiddenStated).toBeNull();
    expect(JSON.stringify(m)).not.toMatch(/ai_allowed|human-only/);
  });

  it("counts not-yet-launched only among open entries, and a launch on the reading day as launched", () => {
    const m = summarisePrizeIntake(
      listOf(
        entry({ launched: "29 Sep 2026" }), // launched today: not "not yet launched"
        entry({ launched: "30 Sep 2026" }), // open, launches tomorrow
        entry({ deadline: "1 Jan 2026", launched: "1 Oct 2026" }), // closed: not counted, whatever its launch
        entry({ deadline: "TBC", launched: "1 Oct 2026" }), // undatable: not open, so not counted
      ),
      MEASURED,
    );
    expect(m.open).toBe(2);
    expect(m.openNotYetLaunched).toBe(1);
  });

  it("does not count a whitespace-only note as a note", () => {
    const m = summarisePrizeIntake(listOf(entry({ note: "   " }), entry({ note: "" }), entry({ note: " residents only " })), MEASURED);
    expect(m.openWithNote).toBe(1);
  });

  it("counts an open entry not yet launched, one whose registration closed, and one with a note", () => {
    const m = summarisePrizeIntake(
      listOf(
        entry({ launched: "1 Oct 2026" }),
        entry({ "registration-deadline": "28 Sep 2026" }),
        entry({ "registration-deadline": "29 Sep 2026", note: "open to U.S. residents only" }),
        entry({ deadline: "1 Jan 2026", note: "closed; not counted" }),
      ),
      MEASURED,
    );
    expect(m.open).toBe(3);
    expect(m.openNotYetLaunched).toBe(1);
    expect(m.openRegistrationClosed).toBe(1); // the registration deadline is inclusive too
    expect(m.openWithNote).toBe(1);
  });

  it("counts an unreadable prize, launch or registration date as unread — in none of the other counts, never a silent zero", () => {
    const m = summarisePrizeIntake(
      listOf(
        entry({ prize: "US$14,925", launched: "soon", "registration-deadline": "TBC" }),
        entry({ prize: "$2,000", "registration-deadline": "28 Sep 2026" }),
        entry({ prize: "$3,000", launched: "1 Oct 2026" }),
        entry({ prize: null, launched: null, "registration-deadline": "  " }), // not stated: neither read nor unread
      ),
      MEASURED,
    );
    expect(m.open).toBe(4);
    expect(m.openWithStatedUsdPrize).toBe(2);
    expect(m.openStatedUsdPrizeTotal).toBe(5000);
    expect(m.openPrizeUnparsed).toBe(1);
    expect(m.openNotYetLaunched).toBe(1);
    expect(m.openLaunchedUnparsed).toBe(1);
    expect(m.openRegistrationClosed).toBe(1);
    expect(m.openRegistrationDeadlineUnparsed).toBe(1);
  });

  it("refuses a list whose prizes, launch dates or registration deadlines mostly stopped parsing: the format moved", () => {
    const moved: [Record<string, unknown>, RegExp][] = [
      [{ prize: "US$14,925" }, /3 of 3 stated prize values do not parse/],
      [{ launched: "2026-09-01" }, /3 of 3 stated launched values do not parse/],
      [{ "registration-deadline": "2026-10-01" }, /3 of 3 stated registration-deadline values do not parse/],
    ];
    for (const [over, why] of moved) {
      const body = listOf(entry(over), entry(over), entry({ ...over, deadline: "1 Jan 2026" }));
      expect(() => summarisePrizeIntake(body, MEASURED), JSON.stringify(over)).toThrow(why);
    }
    // At exactly half the guard holds its fire: one odd value among two is counted as unread, not a moved format.
    const half = summarisePrizeIntake(listOf(entry({ prize: "€9,000" }), entry()), MEASURED);
    expect(half.openPrizeUnparsed).toBe(1);
    expect(half.openWithStatedUsdPrize).toBe(1);
    // A field nobody states is not a moved format.
    expect(() => summarisePrizeIntake(listOf(entry({ prize: null }), entry({ prize: null })), MEASURED)).not.toThrow();
  });

  it("holds the deadline guard's fire at exactly half, and fires just past it", () => {
    const half = summarisePrizeIntake(listOf(entry({ deadline: "TBC" }), entry({ deadline: "?" }), entry(), entry()), MEASURED);
    expect(half.undatable).toBe(2);
    expect(half.open).toBe(2);
    expect(() =>
      summarisePrizeIntake(listOf(entry({ deadline: "TBC" }), entry({ deadline: "?" }), entry({ deadline: "x" }), entry(), entry()), MEASURED),
    ).toThrow(/3 of 5 deadlines do not parse/);
  });

  it("refuses to produce a number from a body that is not the list: never a fake zero", () => {
    const bad: [string, RegExp][] = [
      ["not json", /not JSON/],
      ["[]", /no data array/],
      [JSON.stringify({ data: [] }), /empty/],
      [JSON.stringify({ data: [entry(), "x"] }), /entry 1 is not an object/],
      [listOf(entry({ deadline: "TBC" }), entry({ deadline: "?" }), entry()), /2 of 3 deadlines do not parse/],
    ];
    for (const [body, why] of bad) {
      expect(() => summarisePrizeIntake(body, MEASURED), body).toThrow(PrizeIntakeError);
      expect(() => summarisePrizeIntake(body, MEASURED), body).toThrow(why);
    }
    expect(() => summarisePrizeIntake(FIXTURE_TEXT, "not a date")).toThrow(PrizeIntakeError);
  });
});

describe("runPrizeIntake — one GET, then the file or nothing", () => {
  let dir: string;
  let out: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "prize-intake-"));
    out = join(dir, "state", "colony", "prize-intake.json");
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  const fakeFetch = (status: number, body: string, calls: { url: string; init?: RequestInit }[] = []) =>
    (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return new Response(body, { status });
    }) as typeof fetch;

  it("requests the one source URL, refuses redirects, and writes the summary", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const r = await runPrizeIntake({ outFile: out, nowIso: MEASURED, fetchImpl: fakeFetch(200, FIXTURE_TEXT, calls) });
    expect(r.code).toBe(0);
    expect(calls.map((c) => c.url)).toEqual([PRIZE_INTAKE_SOURCE]);
    expect(calls[0].init?.redirect).toBe("error");
    expect(calls[0].init?.method ?? "GET").toBe("GET");
    const written = JSON.parse(readFileSync(out, "utf8"));
    expect(written).toEqual(summarisePrizeIntake(FIXTURE_TEXT, MEASURED));
    expect(r.message).toMatch(/9 open of 14 listed/);
    expect(r.message).toMatch(/AI rule: not stated by the list/);
  });

  it("writes nothing and exits 1 on any status but 200, even when the body is the list", async () => {
    for (const status of [201, 203, 301, 403, 404, 429, 500]) {
      const r = await runPrizeIntake({ outFile: out, nowIso: MEASURED, fetchImpl: fakeFetch(status, FIXTURE_TEXT) });
      expect(r.code, String(status)).toBe(1);
      expect(r.message).toMatch(new RegExp(`HTTP ${status}.*Nothing was written`, "s"));
      expect(existsSync(out)).toBe(false);
    }
  });

  it("says the AI rule is unknown, not absent, when the list grows a field it does not know", async () => {
    const body = listOf(entry({ ai_generated_submissions: "forbidden" }), entry());
    const r = await runPrizeIntake({ outFile: out, nowIso: MEASURED, fetchImpl: fakeFetch(200, body) });
    expect(r.code).toBe(0);
    expect(r.message).toMatch(/AI rule: unknown \(1 new field to read by hand\)/);
    expect(r.message).not.toMatch(/not stated/);
    expect(JSON.parse(readFileSync(out, "utf8")).aiRuleFieldInSource).toBeNull();
  });

  it("writes nothing and exits 1 on an HTTP error, a network failure or a body that is not the list", async () => {
    const failing: typeof fetch[] = [
      fakeFetch(404, "Not Found"),
      fakeFetch(200, "<html>rate limited</html>"),
      fakeFetch(200, JSON.stringify({ data: [] })),
      (async () => {
        throw new TypeError("fetch failed");
      }) as typeof fetch,
    ];
    for (const fetchImpl of failing) {
      const r = await runPrizeIntake({ outFile: out, nowIso: MEASURED, fetchImpl });
      expect(r.code).toBe(1);
      expect(r.message).toMatch(/NOT measured.*Nothing was written/s);
      expect(existsSync(out)).toBe(false);
    }
  });

  it("leaves last week's file untouched when this week's read fails", async () => {
    await runPrizeIntake({ outFile: out, nowIso: MEASURED, fetchImpl: fakeFetch(200, FIXTURE_TEXT) });
    const before = readFileSync(out, "utf8");
    const r = await runPrizeIntake({ outFile: out, nowIso: "2026-10-06T05:41:00Z", fetchImpl: fakeFetch(503, "") });
    expect(r.code).toBe(1);
    expect(readFileSync(out, "utf8")).toBe(before);
  });
});

describe("readPrizeIntake — state/colony/prize-intake.json → one report line", () => {
  let dir: string;
  let file: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "prize-intake-read-"));
    file = join(dir, "prize-intake.json");
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));
  const write = (body: unknown) => writeFileSync(file, typeof body === "string" ? body : JSON.stringify(body));
  const good = () => summarisePrizeIntake(FIXTURE_TEXT, MEASURED);

  it("defaults to the file the workflow commits, and calls a reading stale after 8 days", () => {
    expect(PRIZE_INTAKE_FILE).toBe(join("state", "colony", "prize-intake.json"));
    expect(PRIZE_INTAKE_STALE_DAYS).toBe(8);
  });

  it("says there is no reading yet before the weekly job has run", () => {
    const r = readPrizeIntake(file, T0);
    expect(r.status).toBe("absent");
    expect(r.line).toBe("Prize-event intake (instrument only): no reading yet — the weekly job .github/workflows/prize-intake.yml has not committed one.");
  });

  const PARTLY_BUILT =
    " Partly built: this is the list-count half of BOARD-LOOP §13; its number (events with deadlines in the quarter whose rules pages" +
    " explicitly permit AI-built entries) needs a per-event rules-page read that is not built.";

  it("prints the counts, says the AI rule is not stated, and says it is an instrument and only half of §13", () => {
    write(good());
    const r = readPrizeIntake(file, T0 + DAY / 2);
    expect(r.status).toBe("read");
    expect(r.line).toBe(
      "Prize-event intake (instrument only; files nothing): 9 open of 14 listed on the mlcontests list, read 2026-09-29 05:41 UTC (0.5 days ago) — " +
        "2 with registration already closed, 0 not yet launched, 7 with a stated USD prize ($861,225 stated in total, all places combined, not an expected payout), " +
        "1 listed with a deadline that does not parse (neither open nor closed). " +
        "AI or automated solutions allowed: not counted — none of the list's fields states it." +
        PARTLY_BUILT,
    );
  });

  it("names the open prizes and dates it could not read, so a zero beside them is not taken for a real zero", () => {
    write({ ...good(), openWithStatedUsdPrize: 0, openStatedUsdPrizeTotal: 0, openPrizeUnparsed: 7, openLaunchedUnparsed: 1, openRegistrationDeadlineUnparsed: 2 });
    expect(readPrizeIntake(file, T0).line).toContain(
      "0 with a stated USD prize ($0 stated in total, all places combined, not an expected payout), 1 listed with a deadline that does not parse " +
        "(neither open nor closed). Stated among the open but not read, so in none of those counts: 7 prizes not stated as a plain $ amount, " +
        "1 launch date, 2 registration deadlines. AI or automated",
    );
    write({ ...good(), openWithStatedUsdPrize: 6, openPrizeUnparsed: 1 });
    expect(readPrizeIntake(file, T0).line).toContain("so in none of those counts: 1 prize not stated as a plain $ amount. AI or automated");
  });

  it("says the AI rule is unknown when the list carries fields it does not know, and flags a reading older than 8 days", () => {
    write({ ...good(), unknownFields: 2, aiRuleFieldInSource: null });
    const line = readPrizeIntake(file, T0).line;
    expect(line).toContain(
      ". AI or automated solutions allowed: unknown — the list carries 2 fields this reader does not know, any of which may state it; read them by hand." +
        PARTLY_BUILT,
    );
    expect(line).not.toMatch(/none of the list's fields states it/);
    write({ ...good(), unknownFields: 1, aiRuleFieldInSource: null });
    expect(readPrizeIntake(file, T0).line).toContain("the list carries 1 field this reader does not know, which may state it; read it by hand.");
    write(good());
    expect(readPrizeIntake(file, T0 + 8 * DAY).line).not.toMatch(/STALE/);
    expect(readPrizeIntake(file, T0 + 8.5 * DAY).line).toMatch(/ STALE: read 8\.5 days ago, so the weekly job has missed a run; these are not this week's numbers\.$/);
  });

  it("refuses a file that is not a reading, without echoing its content", () => {
    const cases: unknown[] = [
      "not json",
      [],
      { ...good(), measuredAt: "yesterday" },
      { ...good(), open: -1 },
      { ...good(), open: "30 (Sponsor Alpha)" },
      { ...good(), listed: 3 }, // fewer listed than open
      { ...good(), openAiAllowedStated: 4 }, // an AI count this reader never produces
      { ...good(), openAiNotForbiddenStated: 0 },
      { ...good(), aiRuleFieldInSource: true },
      { ...good(), unknownFields: 1 }, // a new field, yet "the list has no AI field": the contradiction this reader refuses
      { ...good(), aiRuleFieldInSource: null }, // unknown with no unknown field
      { ...good(), unknownFields: "2 (ai_rule: Sponsor Alpha)", aiRuleFieldInSource: null },
      { ...good(), openStatedUsdPrizeTotal: -5 },
      { ...good(), openStatedUsdPrizeTotal: 1.5 },
      { ...good(), sourceBytes: 2.5 },
      { ...good(), openPrizeUnparsed: undefined },
      { ...good(), openRegistrationClosed: 10 }, // each open-subset count must fit inside open (9)
      { ...good(), openNotYetLaunched: 10 },
      { ...good(), openWithStatedUsdPrize: 10 },
      { ...good(), openPrizeUnparsed: 10 },
      { ...good(), openLaunchedUnparsed: 10 },
      { ...good(), openRegistrationDeadlineUnparsed: 10 },
      { ...good(), openWithNote: 10 },
      { ...good(), openPrizeUnparsed: 3 }, // 7 read + 3 unread prizes among 9 open
    ];
    for (const c of cases) {
      write(c);
      const r = readPrizeIntake(file, T0);
      expect(r.status, JSON.stringify(c)).toBe("invalid");
      expect(r.line).toMatch(/^Prize-event intake: the file .* is unusable \(.+\); its numbers are not shown\.$/);
      expect(r.line).not.toMatch(/Sponsor Alpha|yesterday/);
    }
  });
});

describe("the tick carries the prize intake into the report", () => {
  let db: BetterSqlite3.Database;
  let dir: string;
  beforeEach(() => {
    db = createInMemoryDb();
    dir = mkdtempSync(join(tmpdir(), "prize-intake-tick-"));
  });
  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("prints exactly one prize-intake line under This tick, and never a blocker", async () => {
    const file = join(dir, "prize-intake.json");
    writeFileSync(file, JSON.stringify(summarisePrizeIntake(FIXTURE_TEXT, MEASURED)));
    const result = await tick(db, { nowIso: MEASURED, prizeIntakeFile: file, brandMailFile: join(dir, "none.json"), measurementsDir: dir });
    expect(result.prizeIntake.status).toBe("read");
    const report = renderReport(db, result);
    const thisTick = report.split("## This tick")[1].split("\n## ")[0];
    expect(thisTick.match(/^- Prize-event intake/gm)).toHaveLength(1);
    expect(thisTick).toContain("- Prize-event intake (instrument only; files nothing): 9 open of 14 listed");
    expect(result.blockers.join("\n")).not.toMatch(/prize/i);
  });

  it("prints the no-reading-yet line before the first weekly run", async () => {
    const result = await tick(db, { nowIso: MEASURED, prizeIntakeFile: join(dir, "absent.json"), brandMailFile: join(dir, "none.json"), measurementsDir: dir });
    expect(result.prizeIntake.status).toBe("absent");
    expect(renderReport(db, result)).toContain("- Prize-event intake (instrument only): no reading yet");
  });
});
