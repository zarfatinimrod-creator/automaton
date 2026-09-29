/**
 * Revenue Colony — the brand-mailbox probe in the report (owner step 8; research/breadth/BOARD.md Q2).
 *
 * `scripts/brand_mail.py probe --out state/colony/brand-mail.json` (run by .github/workflows/brand-mail.yml) reads the
 * brand mailbox over IMAP, read-only, and commits NUMBERS ONLY: messages and unread in the inbox, possible replies to
 * each venue question we sent (threaded to it, from the venue's domain, or carrying its subject; All Mail and Spam), and
 * accessibility-contact mail received / unanswered / unanswered for 7+ days (All Mail, so archiving answers nothing).
 * Like the measurement files (measurements.ts), the job never opens colony.db; the tick reads the file here.
 *
 * The file becomes one line of the report, and accessibility mail unanswered for 7+ days becomes a blocker: the brand
 * mailbox is il-biz-tools' published accessibility contact, and the colony answers it itself — the owner never answers
 * anyone. The age is advanced by the time since the probe, so a mail that was 5 days old at a probe 3 days ago is
 * overdue now even though the probe said 0. A reading older than PROBE_STALE_DAYS is a blocker of its own: a probe that
 * stopped (a failed login, a server error, never scheduled) leaves the last good numbers in place, and the mail that
 * arrived since is unseen.
 *
 * The probe also lists the responders brand-mail.yml runs on its schedule (`responders`, RULING-2026-09-29-lines (h)):
 * ["gumroad-refund"] once the Pro refund responder is scheduled. A probe written before that has no key, which reads
 * as "responders: none", not as invalid; il-biz-tools' `enable` refuses to open the sale without the responder, and
 * src/__tests__/revenue/brand-mail-parity.test.ts holds the two readers to the same verdict.
 *
 * Nothing but numbers, a timestamp, our own venue ids and our own responder ids is ever printed from this file. A file
 * carrying anything else where a number or an id belongs is invalid, and its content is not echoed.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const BRAND_MAIL_PROBE_FILE = join("state", "colony", "brand-mail.json");

/** Accessibility mail unanswered this long is a blocker (research/breadth/BOARD.md Q2). */
export const A11Y_ANSWER_DAYS = 7;

/** A configured reading older than this is a blocker: once the probe runs with the hourly tick, two days is many misses. */
export const PROBE_STALE_DAYS = 2;

const DAY_MS = 86_400_000;
const VENUE_ID = /^[a-z0-9][a-z0-9-]{0,40}$/;

export interface BrandMailReading {
  file: string;
  status: "absent" | "unconfigured" | "read" | "invalid";
  line: string | null;
  blockers: string[];
}

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;
const isAge = (v: unknown): v is number | null => v === null || (typeof v === "number" && Number.isFinite(v) && v >= 0);

/** "2026-10-20 12:00 UTC" */
const utcMinute = (iso: string): string => `${new Date(iso).toISOString().slice(0, 16).replace("T", " ")} UTC`;

interface Probe {
  measuredAt: string;
  inbox: number;
  unread: number;
  repliesByVenue: Record<string, number>;
  accessibility: { received: number; unanswered: number; unansweredOver7Days: number; oldestUnansweredAgeDays: number | null };
  sentFolderFound: boolean;
  allMailFound: boolean;
  responders?: string[];
}

/** The reason a configured reading is unusable, or null. Never quotes the offending value. */
function problemWith(data: Record<string, unknown>): string | null {
  for (const key of ["inbox", "unread"] as const) if (!isCount(data[key])) return `${key} is not a count`;
  const replies = data.repliesByVenue;
  if (typeof replies !== "object" || replies === null || Array.isArray(replies)) return "repliesByVenue is not an object";
  for (const [venue, n] of Object.entries(replies)) {
    if (!VENUE_ID.test(venue)) return "repliesByVenue has a key that is not a venue id";
    if (!isCount(n)) return "repliesByVenue has a value that is not a count";
  }
  const a = data.accessibility as Record<string, unknown> | undefined;
  if (typeof a !== "object" || a === null) return "accessibility is missing";
  for (const key of ["received", "unanswered", "unansweredOver7Days"]) if (!isCount(a[key])) return `accessibility.${key} is not a count`;
  if (!isAge(a.oldestUnansweredAgeDays)) return "accessibility.oldestUnansweredAgeDays is not an age";
  if (typeof data.sentFolderFound !== "boolean") return "sentFolderFound is not a boolean";
  if (typeof data.allMailFound !== "boolean") return "allMailFound is not a boolean";
  const responders = data.responders;
  if (responders !== undefined && !(Array.isArray(responders) && responders.every((r) => typeof r === "string" && VENUE_ID.test(r)))) {
    return "responders is not a list of responder ids";
  }
  return null;
}

export function readBrandMailProbe(file: string = BRAND_MAIL_PROBE_FILE, nowMs: number = Date.now()): BrandMailReading {
  const out: BrandMailReading = { file, status: "absent", line: null, blockers: [] };
  if (!existsSync(file)) return out;

  const invalid = (detail: string): BrandMailReading => ({
    ...out,
    status: "invalid",
    line: `Brand mailbox: the probe file ${file} is unusable (${detail}); its numbers are not shown.`,
    blockers: [`brand-mail probe ${file}: ${detail}`],
  });

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return invalid("not JSON");
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) return invalid("not a JSON object");
  const measuredAt = typeof data.measuredAt === "string" && !Number.isNaN(Date.parse(data.measuredAt)) ? data.measuredAt : null;
  if (!measuredAt) return invalid("no usable measuredAt");

  if (data.configured === false) {
    return {
      ...out,
      status: "unconfigured",
      line:
        `Brand mailbox (owner step 8): not configured at the probe of ${utcMinute(measuredAt)} — the secrets ` +
        "BRAND_MAIL_ADDRESS and BRAND_MAIL_APP_PASSWORD do not exist yet, so nothing is read or sent.",
    };
  }
  if (data.configured !== true) return invalid("configured is not true or false");
  const problem = problemWith(data);
  if (problem) return invalid(problem);
  const p = data as unknown as Probe;

  const sinceDays = Math.max(0, (nowMs - Date.parse(measuredAt)) / DAY_MS);
  const replies = Object.entries(p.repliesByVenue);
  const a = p.accessibility;
  const responders = p.responders ?? [];
  const line =
    `Brand mailbox (probed ${utcMinute(measuredAt)}, ${sinceDays.toFixed(1)} days ago): ${p.inbox} in the inbox, ${p.unread} unread; ` +
    `responders: ${responders.length ? responders.join(", ") : "none"}; ` +
    `possible replies to our questions: ${replies.length ? replies.map(([v, n]) => `${v} ${n}`).join(", ") : "none (no question sent yet)"}; ` +
    `accessibility mail: ${a.received} received, ${a.unanswered} unanswered, ${a.unansweredOver7Days} unanswered for ${A11Y_ANSWER_DAYS}+ days.` +
    (p.sentFolderFound ? "" : " No Sent folder was found, so no accessibility mail can count as answered.") +
    (p.allMailFound ? "" : " No All Mail folder was found, so only the inbox was read: archived mail is not counted.");

  const blockers: string[] = [];
  if (sinceDays > PROBE_STALE_DAYS) {
    blockers.push(
      `brand-mail probe ${file} is ${sinceDays.toFixed(1)} days old (probe of ${utcMinute(measuredAt)}): accessibility mail ` +
        "and venue replies since then are unseen. Re-run the probe (brand-mail.yml, command probe) and read its log; " +
        "once step 8 is done that workflow's schedule runs it twice a day, so a stale reading means those runs are failing.",
    );
  }
  const oldestNow = a.oldestUnansweredAgeDays === null ? null : a.oldestUnansweredAgeDays + sinceDays;
  const agedSinceProbe = a.unansweredOver7Days === 0 && oldestNow !== null && oldestNow >= A11Y_ANSWER_DAYS;
  if (a.unansweredOver7Days > 0 || agedSinceProbe) {
    // The probe's count is exact only at the probe. Since then, a younger unanswered mail may have crossed the line
    // too, so the count becomes a floor whenever there are unanswered mails it did not include.
    const mayHaveGrown = sinceDays > 0 && a.unanswered > a.unansweredOver7Days;
    const floor = Math.max(a.unansweredOver7Days, agedSinceProbe ? 1 : 0);
    const count = mayHaveGrown ? `at least ${floor}` : String(floor);
    blockers.push(
      `${count} accessibility mail(s) to the brand mailbox unanswered for ${A11Y_ANSWER_DAYS}+ days` +
        (oldestNow === null ? "" : ` (oldest ${oldestNow.toFixed(1)} days now`) +
        `${oldestNow === null ? " (" : "; "}probe of ${utcMinute(measuredAt)}). ` +
        "The brand mailbox is il-biz-tools' published accessibility contact and the colony answers it itself " +
        "(research/breadth/BOARD.md Q2): answer in the sender's thread from the brand address, then re-run the brand-mail probe.",
    );
  }
  return { ...out, status: "read", line, blockers };
}
