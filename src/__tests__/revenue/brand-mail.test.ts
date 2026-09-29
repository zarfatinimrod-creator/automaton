/**
 * The brand-mail probe reaches the colony report (research/breadth/BOARD.md Q2): scripts/brand_mail.py probe writes
 * numbers to state/colony/brand-mail.json; the tick reads that file into one report line, and accessibility mail
 * unanswered for 7+ days becomes a blocker. Nothing but numbers and our own venue ids is ever printed from it.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { A11Y_ANSWER_DAYS, BRAND_MAIL_PROBE_FILE, PROBE_STALE_DAYS, readBrandMailProbe } from "../../revenue/brand-mail.js";
import { renderReport, tick } from "../../revenue/runner.js";

const DAY = 86_400_000;
const MEASURED = "2026-10-20T12:00:00Z";
const T0 = Date.parse(MEASURED);

const reading = (over: Record<string, unknown> = {}, a11y: Record<string, unknown> = {}) => ({
  configured: true,
  measuredAt: MEASURED,
  inbox: 5,
  unread: 2,
  repliesByVenue: { crazygames: 1 },
  accessibility: { received: 3, unanswered: 2, unansweredOver7Days: 0, oldestUnansweredAgeDays: 2.0, ...a11y },
  sentFolderFound: true,
  allMailFound: true,
  ...over,
});

describe("readBrandMailProbe — state/colony/brand-mail.json → one report line and its blockers", () => {
  let dir: string;
  let file: string;
  const write = (body: unknown) => writeFileSync(file, typeof body === "string" ? body : JSON.stringify(body));

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "brand-mail-"));
    file = join(dir, "brand-mail.json");
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("defaults to the file the workflow commits, and a seven-day answer window", () => {
    expect(BRAND_MAIL_PROBE_FILE).toBe(join("state", "colony", "brand-mail.json"));
    expect(A11Y_ANSWER_DAYS).toBe(7);
    expect(PROBE_STALE_DAYS).toBe(2);
  });

  it("says nothing before any probe has run — the normal state before step 8", () => {
    expect(readBrandMailProbe(file, T0)).toEqual({ file, status: "absent", line: null, blockers: [] });
  });

  it("prints a not-configured probe as a line, not a blocker", () => {
    write({ configured: false, measuredAt: MEASURED });
    const r = readBrandMailProbe(file, T0);
    expect(r.status).toBe("unconfigured");
    expect(r.line).toMatch(/^Brand mailbox \(owner step 8\): not configured/);
    expect(r.blockers).toEqual([]);
  });

  it("prints the counts as one line and raises no blocker while every accessibility mail is younger than 7 days", () => {
    write(reading());
    const r = readBrandMailProbe(file, T0 + DAY / 2);
    expect(r.status).toBe("read");
    expect(r.line).toBe(
      "Brand mailbox (probed 2026-10-20 12:00 UTC, 0.5 days ago): 5 in the inbox, 2 unread; responders: none; " +
        "possible replies to our questions: crazygames 1; " +
        "accessibility mail: 3 received, 2 unanswered, 0 unanswered for 7+ days.",
    );
    expect(r.blockers).toEqual([]);
  });

  // RULING-2026-09-29-lines (h): the probe lists the scheduled responders; a probe written before that has no key.
  it("names the responders the probe lists, and says none when the key is absent or the list empty", () => {
    write(reading({ responders: ["gumroad-refund"] }));
    expect(readBrandMailProbe(file, T0).line).toContain("2 unread; responders: gumroad-refund; possible replies");
    write(reading({ responders: [] }));
    expect(readBrandMailProbe(file, T0).line).toContain("responders: none;");
    write(reading());
    const absent = readBrandMailProbe(file, T0);
    expect(absent.status).toBe("read");
    expect(absent.line).toContain("responders: none;");
  });

  it("makes a responders value that is not a list of ids invalid, without echoing it", () => {
    for (const responders of ["gumroad-refund", null, [1], ["Someone <someone@example.org>"]]) {
      write(reading({ responders }));
      const r = readBrandMailProbe(file, T0);
      expect(r.status, JSON.stringify(responders)).toBe("invalid");
      expect(r.blockers.join(" ")).toMatch(/responders is not a list of responder ids/);
      expect([r.line, ...r.blockers].join(" ")).not.toContain("someone@example.org");
    }
  });

  it("says plainly when no question has been sent yet", () => {
    write(reading({ repliesByVenue: {} }));
    expect(readBrandMailProbe(file, T0).line).toMatch(/no question sent yet/);
  });

  it("turns accessibility mail unanswered for 7+ days into a blocker", () => {
    write(reading({}, { unansweredOver7Days: 1, oldestUnansweredAgeDays: 10.0 }));
    const r = readBrandMailProbe(file, T0);
    expect(r.blockers).toHaveLength(1);
    expect(r.blockers[0]).toMatch(/^1 accessibility mail\(s\) to the brand mailbox unanswered for 7\+ days/);
    expect(r.blockers[0]).toMatch(/il-biz-tools/);
    expect(r.blockers[0]).toMatch(/oldest 10\.0 days/);
  });

  it("counts time since the probe: a 5-day-old mail probed 2 days ago is overdue now", () => {
    write(reading({}, { unansweredOver7Days: 0, oldestUnansweredAgeDays: 5.0 }));
    expect(readBrandMailProbe(file, T0 + 1 * DAY).blockers).toEqual([]);
    const later = readBrandMailProbe(file, T0 + 2 * DAY);
    expect(later.blockers).toHaveLength(1);
    expect(later.blockers[0]).toMatch(/^at least 1 accessibility mail\(s\)/);
    expect(later.blockers[0]).toMatch(/oldest 7\.0 days/);
  });

  it("makes a reading older than two days a blocker of its own: mail since then is unseen", () => {
    write(reading());
    expect(readBrandMailProbe(file, T0 + 2 * DAY).blockers).toEqual([]);
    const stale = readBrandMailProbe(file, T0 + 2.5 * DAY);
    expect(stale.status).toBe("read");
    expect(stale.blockers).toEqual([
      `brand-mail probe ${file} is 2.5 days old (probe of 2026-10-20 12:00 UTC): accessibility mail and venue replies ` +
        "since then are unseen. Re-run the probe (brand-mail.yml, command probe) and read its log; once step 8 is done " +
        "that workflow's schedule runs it twice a day, so a stale reading means those runs are failing.",
    ]);
    // A not-configured reading is not stale: before step 8 there is nothing to read.
    write({ configured: false, measuredAt: MEASURED });
    expect(readBrandMailProbe(file, T0 + 30 * DAY).blockers).toEqual([]);
  });

  it("never states an exact overdue count that time since the probe may have made too small", () => {
    // 2 unanswered at the probe, 1 of them already overdue. A day later the other may be overdue too: "at least 1".
    write(reading({}, { unanswered: 2, unansweredOver7Days: 1, oldestUnansweredAgeDays: 10.0 }));
    expect(readBrandMailProbe(file, T0).blockers[0]).toMatch(/^1 accessibility mail/);
    expect(readBrandMailProbe(file, T0 + DAY).blockers[0]).toMatch(/^at least 1 accessibility mail/);
    // Every unanswered mail was already overdue: the count cannot grow, so it stays exact.
    write(reading({}, { unanswered: 1, unansweredOver7Days: 1, oldestUnansweredAgeDays: 10.0 }));
    expect(readBrandMailProbe(file, T0 + DAY).blockers[0]).toMatch(/^1 accessibility mail/);
  });

  it("says so when the probe found no Sent folder, since then nothing can count as answered", () => {
    write(reading({ sentFolderFound: false }));
    expect(readBrandMailProbe(file, T0).line).toMatch(/No Sent folder was found, so no accessibility mail can count as answered\.$/);
  });

  it("says so when the probe found no All Mail folder, since then archived mail is not counted", () => {
    write(reading({ allMailFound: false }));
    expect(readBrandMailProbe(file, T0).line).toMatch(/No All Mail folder was found, so only the inbox was read: archived mail is not counted\.$/);
    write(reading({ allMailFound: "yes" }));
    expect(readBrandMailProbe(file, T0).status).toBe("invalid");
  });

  it("reports a broken file as a blocker", () => {
    write("{ not json");
    const r = readBrandMailProbe(file, T0);
    expect(r.status).toBe("invalid");
    expect(r.blockers[0]).toMatch(/^brand-mail probe .*brand-mail\.json: not JSON/);
  });

  it("refuses a count that is not a number, and a measuredAt that is not a date", () => {
    write(reading({ unread: "2" }));
    expect(readBrandMailProbe(file, T0).status).toBe("invalid");
    write(reading({ measuredAt: "yesterday" }));
    expect(readBrandMailProbe(file, T0).status).toBe("invalid");
    write(reading({}, { unansweredOver7Days: -1 }));
    expect(readBrandMailProbe(file, T0).status).toBe("invalid");
  });

  it("never prints a string from the file: a leaked sender or subject makes it invalid, and is not echoed", () => {
    write(reading({ repliesByVenue: { "alpha@venue.example": 1 } }));
    const bad = readBrandMailProbe(file, T0);
    expect(bad.status).toBe("invalid");
    write(reading({ from: "Sender Alpha <alpha@venue.example>", subject: "Re: Question" }));
    const extra = readBrandMailProbe(file, T0);
    for (const r of [bad, extra]) {
      const printed = [r.line ?? "", ...r.blockers].join("\n");
      expect(printed).not.toMatch(/alpha|Sender|venue\.example|Re: Question/i);
    }
  });
});

describe("the tick carries the brand-mail probe into the report", () => {
  let db: BetterSqlite3.Database;
  let dir: string;
  beforeEach(() => {
    db = createInMemoryDb();
    dir = mkdtempSync(join(tmpdir(), "brand-mail-tick-"));
  });
  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("prints the line under This tick and the overdue accessibility mail under Blocked on", async () => {
    const file = join(dir, "brand-mail.json");
    writeFileSync(file, JSON.stringify(reading({}, { unansweredOver7Days: 2, oldestUnansweredAgeDays: 9.5 })));
    const result = await tick(db, { nowIso: MEASURED, brandMailFile: file, measurementsDir: dir });
    expect(result.brandMail.status).toBe("read");
    const blocker = result.blockers.find((b) => b.includes("accessibility mail(s) to the brand mailbox"));
    expect(blocker).toMatch(/^2 accessibility mail\(s\)/);
    const report = renderReport(db, result);
    const thisTick = report.split("## This tick")[1].split("## ")[0];
    expect(thisTick).toContain("- Brand mailbox (probed 2026-10-20 12:00 UTC");
    expect(report.split("## Blocked on")[1]).toContain(blocker!);
  });

  it("prints nothing about the mailbox when no probe has run", async () => {
    const result = await tick(db, { nowIso: MEASURED, brandMailFile: join(dir, "absent.json"), measurementsDir: dir });
    expect(result.brandMail.status).toBe("absent");
    expect(renderReport(db, result)).not.toMatch(/Brand mailbox/);
  });
});
