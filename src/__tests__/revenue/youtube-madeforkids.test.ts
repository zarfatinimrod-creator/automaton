import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MAX_IDS_PER_CALL,
  READ_HOST,
  VIDEOS_LIST_URL,
  assertColonyFactsOnly,
  emptyState,
  firstUploadWindow,
  mergeReadings as mergeReadingsOf,
  parseVideosList,
  readbackOf,
  stayedPublic,
  videosListUrl,
  type MadeForKidsReading,
  type MadeForKidsState,
  type UploadReadback,
} from "../../revenue/youtube-madeforkids.js";
import { FACELESS_YOUTUBE_EXPERIMENT, KIDS_EXPLAINERS_EXPERIMENT, evaluateExperiment, type ExperimentReadings } from "../../revenue/experiments.js";
import {
  API_KEY_ENV,
  API_TERMS_EXCERPT,
  API_TERMS_SITE,
  TERMS_VERDICTS,
  apiTermsGate,
  defaultPaths,
  readTermsVerdicts,
  runReadback,
} from "../../../scripts/youtube-madeforkids-readback.js";
// @ts-expect-error — plain ESM script, no type declarations by design
import { termsBarred } from "../../../scripts/render-watch.mjs";

/**
 * The made-for-kids read-back (research/channel-loop/RULING-2026-10-04-kids-youtube.md §6 rule 2, §10; fold action 7):
 * `videos.list`, `part=status`, with an API key from the environment. Every upload is re-read on every run (an override
 * YouTube sets after the first read must be seen: P-2 counts overrides "when YouTube sets them"), and the experiment's
 * state keeps only the colony's own facts about those reads — when the first read, the first designation read and the
 * latest public read were taken, when a read first contradicted the line's declaration or found a public upload no longer
 * public, and the answers to P1's and P2's checks — never a value the API returned
 * (research/channel-loop/RULING-2026-10-12-youtube-derived-metrics.md §2). Every test here is offline: the fetch is a
 * fake that answers from fixtures. No workflow runs the script, and none may (asserted below): it is first run live after
 * Stage A.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const fixture = (name: string) => JSON.parse(readFileSync(resolve(ROOT, `src/__tests__/revenue/fixtures/youtube-videos-list-mfk-${name}.json`), "utf8"));
const AT = "2027-03-11T06:00:00.000Z";
const KEY = "test-key-not-a-real-one";

/** The values the API returns for privacyStatus and, as text, madeForKids: no leaf of a state may be one (ruling 12.10 row 28 §2 decision 2). */
const API_WORDS = ["public", "private", "unlisted", "true", "false"];
const isIsoTime = (s: string) => !Number.isNaN(Date.parse(s)) && new Date(Date.parse(s)).toISOString() === s;
/**
 * The test's own walk of the state's invariant (ruling 12.10 row 28 §2 decision 2), apart from the module's
 * assertColonyFactsOnly: every leaf is null, a boolean, a string that is an ISO time round-tripping through
 * toISOString(), the line id or a video id; and none is one of API_WORDS. Returns the paths of the leaves that fail.
 */
function nonColonyLeaves(state: unknown): string[] {
  const bad: string[] = [];
  const line = (state as { experiment?: unknown } | null)?.experiment;
  const walk = (x: unknown, path: string): void => {
    if (x === null || typeof x === "boolean") return;
    if (Array.isArray(x)) return x.forEach((y, i) => walk(y, `${path}[${i}]`));
    if (typeof x === "object") return Object.entries(x as object).forEach(([k, y]) => walk(y, `${path}.${k}`));
    if (typeof x === "string" && !API_WORDS.includes(x) && (isIsoTime(x) || x === line || /^[A-Za-z0-9_-]{1,64}$/.test(x))) return;
    bad.push(path);
  };
  walk(state, "state");
  return bad;
}

/**
 * mergeReadings, with every state it produces in this file walked for the invariant before a test sees it: "the invariant
 * holds on every state the fixtures produce" (ruling 12.10 row 28 fold 1). A plain throw, not expect, because the
 * firstUploadWindow fixtures are built while the file is collected.
 */
function mergeReadings(...args: Parameters<typeof mergeReadingsOf>): MadeForKidsState {
  const next = mergeReadingsOf(...args);
  const bad = nonColonyLeaves(next);
  if (bad.length) throw new Error(`a state the merge produced holds what is not a colony fact at ${bad.join(", ")}`);
  return next;
}
/** A terms-verdicts.json fixture: two other sites, and a googleapis.com entry with this verdict (none when null). */
function verdictsWith(verdict: string | null, extra: Record<string, unknown> = {}) {
  const sites: Record<string, unknown> = {
    "github.com": { verdict: "NOT_BARRED", source: "fixture", checked: "2026-10-07", copying: "unread" },
    "youtube.com": { verdict: "BARRED", source: "fixture", checked: "2026-09-29", copying: "unread" },
  };
  if (verdict !== null) sites["googleapis.com"] = { verdict, source: "fixture", checked: "2026-10-07", copying: "unread", ...extra };
  return { _about: "test fixture", sites };
}

describe("the request (ruling 4.10 §6 rule 2: videos.list, part=status)", () => {
  it("asks Google's Data API host for the id and status parts of the given videos, with the key", () => {
    const u = new URL(videosListUrl(["kidsVid0001", "kidsVid0002"], KEY));
    expect(u.origin + u.pathname).toBe(VIDEOS_LIST_URL);
    expect(u.hostname).toBe(READ_HOST);
    expect(u.searchParams.get("part")).toBe("id,status");
    expect(u.searchParams.get("id")).toBe("kidsVid0001,kidsVid0002");
    expect(u.searchParams.get("key")).toBe(KEY);
  });

  it("is never a youtube.com request, and its host is not terms-barred", () => {
    expect(READ_HOST).toBe("www.googleapis.com");
    expect(termsBarred(READ_HOST)).toBeNull();
    expect(termsBarred("www.youtube.com")).not.toBeNull();
  });

  it("refuses an empty list, too many ids, an id that is not a plain id, and an empty key", () => {
    expect(() => videosListUrl([], KEY)).toThrow(/at least one/);
    expect(() => videosListUrl(Array.from({ length: MAX_IDS_PER_CALL + 1 }, (_, i) => `v${i}`), KEY)).toThrow(/at most 50/);
    for (const bad of ["a,b", "a&key=x", "", "../x", "a b"]) expect(() => videosListUrl([bad], KEY), bad).toThrow(/not a video id/);
    expect(() => videosListUrl(["kidsVid0001"], "")).toThrow(/API key/);
  });
});

describe("the response, from fixtures (true, false, missing)", () => {
  it("reads true", () => {
    expect(parseVideosList(fixture("true"), ["kidsVid0001"], AT)).toEqual([
      { id: "kidsVid0001", returned: true, madeForKids: "true", privacyStatus: "public", readAt: AT },
    ]);
  });

  it("reads false", () => {
    expect(parseVideosList(fixture("false"), ["kidsVid0002"], AT)).toEqual([
      { id: "kidsVid0002", returned: true, madeForKids: "false", privacyStatus: "public", readAt: AT },
    ]);
  });

  it("reads a video not returned, and one whose status has no madeForKids, as null — never as false", () => {
    // readAt is when the read was taken, whatever it carried: a read that found nothing is still a read.
    expect(parseVideosList(fixture("missing"), ["kidsVid0003", "kidsVid0004"], AT)).toEqual([
      { id: "kidsVid0003", returned: false, madeForKids: null, privacyStatus: null, readAt: AT },
      { id: "kidsVid0004", returned: true, madeForKids: null, privacyStatus: "private", readAt: AT },
    ]);
  });

  it("does not take a string or a number for a boolean", () => {
    const body = { items: [{ id: "a", status: { madeForKids: "false", privacyStatus: "public" } }, { id: "b", status: { madeForKids: 0 } }] };
    expect(parseVideosList(body, ["a", "b"], AT).map((r) => r.madeForKids)).toEqual([null, null]);
  });

  it("answers for the ids asked, in the order asked, and ignores items it did not ask for", () => {
    const body = { items: [fixture("false").items[0], fixture("true").items[0], { id: "stranger", status: { madeForKids: true } }] };
    expect(parseVideosList(body, ["kidsVid0001", "kidsVid0002"], AT).map((r) => [r.id, r.madeForKids])).toEqual([
      ["kidsVid0001", "true"],
      ["kidsVid0002", "false"],
    ]);
  });

  it("throws on an error body or a body with no item list", () => {
    expect(() => parseVideosList({ error: { code: 403, message: "quotaExceeded" } }, ["a"], AT)).toThrow(/quotaExceeded/);
    expect(() => parseVideosList("<html>", ["a"], AT)).toThrow(/not a videos.list response/);
    expect(() => parseVideosList({ kind: "youtube#videoListResponse" }, ["a"], AT)).toThrow(/not a videos.list response/);
  });
});

describe("the experiment state: every upload re-read on every run", () => {
  const T0 = "2027-03-01T00:00:00.000Z";
  const T1R = "2027-03-05T00:00:00.000Z";
  /** A read with no privacyStatus stands for a video the response did not return, as parseVideosList reads one. */
  const read = (id: string, madeForKids: "true" | "false" | null, readAt: string, privacyStatus: string | null = "public"): MadeForKidsReading =>
    ({ id, returned: privacyStatus !== null, madeForKids, privacyStatus, readAt });
  const entry = (id: string, o: Partial<UploadReadback> = {}): UploadReadback => ({
    id, firstReadAt: null, firstReadReturned: null, p1Api: null, firstDesignationAt: null, p2ClockAt: null, lastPublicAt: null,
    leftPublicAt: null, contradictedAt: null, ...o,
  });

  it("starts empty, carrying the line's declared audience", () => {
    expect(emptyState("kids-explainers")).toEqual({ experiment: "kids-explainers", declaresMadeForKids: true, updatedAt: null, videos: [] });
    expect(emptyState("faceless-youtube").declaresMadeForKids).toBe(false);
  });

  it("keeps the first designation read, replaces the latest, and records the times", () => {
    const uploads = [{ id: "v1" }, { id: "v2" }];
    const one = mergeReadings(emptyState("kids-explainers"), uploads, [read("v1", "true", T0), read("v2", null, T0, null)], T0);
    // The first read (ruling 7.10 row 24 amendment 1), whatever it carried, written once: its time, whether it returned
    // the video, and P1's API half judged at it (ruling 12.10 row 28 §2 decision 2: the answer, never the privacyStatus).
    const v1First = { firstReadAt: T0, firstReadReturned: true, p1Api: true };
    const v2First = { firstReadAt: T0, firstReadReturned: false, p1Api: false };
    expect(one.videos).toEqual([
      entry("v1", { ...v1First, firstDesignationAt: T0, p2ClockAt: T0, lastPublicAt: T0 }),
      entry("v2", { ...v2First }),
    ]);
    const two = mergeReadings(one, uploads, [read("v1", "true", T1R), read("v2", "true", T1R)], T1R);
    expect(two.videos[0]).toEqual(entry("v1", { ...v1First, firstDesignationAt: T0, p2ClockAt: T0, lastPublicAt: T1R }));
    expect(two.videos[1]).toEqual(entry("v2", { ...v2First, firstDesignationAt: T1R, p2ClockAt: T1R, lastPublicAt: T1R }));
    expect(two.updatedAt).toBe(T1R);
    expect(readbackOf(two, uploads)).toEqual(["true", "true"]);
  });

  it("T1's line: an override YouTube sets after the first read is seen at the next read and counted", () => {
    const uploads = [{ id: "v1" }];
    const first = mergeReadings(emptyState("faceless-youtube"), uploads, [read("v1", "false", T0)], T0);
    expect(readbackOf(first, uploads)).toEqual(["false"]);
    const later = mergeReadings(first, uploads, [read("v1", "true", T1R)], T1R);
    expect(later.videos[0]!.contradictedAt).toBe(T1R);
    expect(later.videos[0]!.firstDesignationAt).toBe(T0); // the read-back after the upload is kept as it was
    expect(readbackOf(later, uploads)).toEqual(["true"]);
  });

  it("T1's line: an override stays counted after the one appeal sets it back (P-2: \"whatever the one appeal later decides\")", () => {
    const uploads = [{ id: "v1" }];
    const overridden = mergeReadings(emptyState("faceless-youtube"), uploads, [read("v1", "true", T0)], T0);
    const appealed = mergeReadings(overridden, uploads, [read("v1", "false", T1R)], T1R);
    expect(appealed.videos[0]!.lastPublicAt).toBe(T1R); // the appeal's read was taken; its designation is kept nowhere
    expect(appealed.videos[0]!.contradictedAt).toBe(T0);
    expect(readbackOf(appealed, uploads)).toEqual(["true"]);
  });

  it("the kids line: an earlier false is never overwritten by a fresh true (the K-mfk-designation kill stands)", () => {
    const uploads = [{ id: "v1" }];
    const lost = mergeReadings(emptyState("kids-explainers"), uploads, [read("v1", "false", T0)], T0);
    const back = mergeReadings(lost, uploads, [read("v1", "true", T1R)], T1R);
    expect(back.videos[0]!.firstDesignationAt).toBe(T0);
    expect(back.videos[0]!.lastPublicAt).toBe(T1R);
    expect(back.videos[0]!.contradictedAt).toBe(T0);
    expect(readbackOf(back, uploads)).toEqual(["false"]);
  });

  it("the kids line: a false read after a true one is seen and kills", () => {
    const uploads = [{ id: "v1" }];
    const ok = mergeReadings(emptyState("kids-explainers"), uploads, [read("v1", "true", T0)], T0);
    const lost = mergeReadings(ok, uploads, [read("v1", "false", T1R)], T1R);
    expect(readbackOf(lost, uploads)).toEqual(["false"]);
  });

  it("a later read that carries no designation (the video not returned) does not erase the reading", () => {
    const uploads = [{ id: "v1" }];
    const ok = mergeReadings(emptyState("kids-explainers"), uploads, [read("v1", "true", T0)], T0);
    const gone = mergeReadings(ok, uploads, [read("v1", null, T1R, null)], T1R);
    expect(gone.videos[0]!.lastPublicAt).toBe(T0); // the read at T1R found it not public: not returned
    expect(gone.videos[0]!.leftPublicAt).toBe(T1R);
    expect(readbackOf(gone, uploads)).toEqual(["true"]);
  });

  it("an upload the state does not hold yet is unread, never skipped: one entry per upload", () => {
    const state = mergeReadings(emptyState("kids-explainers"), [{ id: "v1" }], [read("v1", "true", T0)], T0);
    expect(readbackOf(state, [{ id: "v1" }, { id: "v2" }])).toEqual(["true", null]);
    expect(readbackOf(emptyState("faceless-youtube"), [{ id: "v1" }])).toEqual([null]);
    expect(readbackOf(emptyState("faceless-youtube"), [])).toEqual([]);
  });

  it("keeps a reading whose upload has left the uploads list, after the listed ones", () => {
    const state = mergeReadings(emptyState("kids-explainers"), [{ id: "v1" }, { id: "v2" }], [read("v1", "true", T0), read("v2", "true", T0)], T0);
    const merged = mergeReadings(state, [{ id: "v2" }], [read("v2", "true", T1R)], T1R);
    expect(merged.videos.map((v) => v.id)).toEqual(["v2", "v1"]);
    expect(merged.videos[1]!.lastPublicAt).toBe(T0); // not asked this run: left as it was
    expect(readbackOf(merged, [{ id: "v2" }])).toEqual(["true", "true"]);
  });

  it("records when an upload that was public stops being public (K-T1k and T1's P2: still public 72 hours later)", () => {
    const uploads = [{ id: "v1" }];
    const at = (h: number) => new Date(Date.parse(T0) + h * 3_600_000).toISOString();
    const pub = mergeReadings(emptyState("kids-explainers"), uploads, [read("v1", "true", at(0))], at(0));
    expect(stayedPublic(pub.videos[0]!, 72)).toBeNull(); // not known yet
    const day1 = mergeReadings(pub, uploads, [read("v1", "true", at(24))], at(24));
    expect(stayedPublic(day1.videos[0]!, 72)).toBeNull();
    const day3 = mergeReadings(day1, uploads, [read("v1", "true", at(72))], at(72));
    expect(day3.videos[0]!.leftPublicAt).toBeNull();
    expect(stayedPublic(day3.videos[0]!, 72)).toBe(true);
    const privated = mergeReadings(day1, uploads, [read("v1", "true", at(30), "private")], at(30));
    expect(privated.videos[0]!.leftPublicAt).toBe(at(30));
    const publicAgain = mergeReadings(privated, uploads, [read("v1", "true", at(80))], at(80));
    expect(publicAgain.videos[0]!.leftPublicAt).toBe(at(30)); // never cleared
    expect(stayedPublic(publicAgain.videos[0]!, 72)).toBe(false);
    const vanished = mergeReadings(day1, uploads, [read("v1", null, at(30), null)], at(30));
    expect(stayedPublic(vanished.videos[0]!, 72)).toBe(false); // not returned is not public
    const neverPublic = mergeReadings(emptyState("kids-explainers"), uploads, [read("v1", "true", at(0), "private")], at(0));
    expect(stayedPublic(mergeReadings(neverPublic, uploads, [read("v1", "true", at(80), "private")], at(80)).videos[0]!, 72)).toBeNull();
  });

  it("a public read that carried no designation does not start the clock (ruling 7.10 row 24 §4 decision 2)", () => {
    // The 72 h are counted from the first read that carried a designation: a public read whose madeForKids is null is an
    // instrument fault (§10 rule 2), and a window that could pass on it would pass on a half-working instrument.
    const uploads = [{ id: "v1" }];
    const at = (h: number) => new Date(Date.parse(T0) + h * 3_600_000).toISOString();
    const undesignated = mergeReadings(emptyState("faceless-youtube"), uploads, [read("v1", null, at(0))], at(0));
    expect(undesignated.videos[0]!.lastPublicAt).toBe(at(0)); // public, no madeForKids
    expect(undesignated.videos[0]!.firstDesignationAt).toBeNull();
    expect(undesignated.videos[0]!.p2ClockAt).toBeNull();
    const day3 = mergeReadings(undesignated, uploads, [read("v1", null, at(72))], at(72));
    expect(stayedPublic(day3.videos[0]!, 72)).toBeNull(); // never true
    const day6 = mergeReadings(day3, uploads, [read("v1", null, at(144))], at(144));
    expect(stayedPublic(day6.videos[0]!, 72)).toBeNull();
    const departed = mergeReadings(day3, uploads, [read("v1", null, at(80), "private")], at(80));
    expect(departed.videos[0]!.leftPublicAt).toBe(at(80));
    expect(stayedPublic(departed.videos[0]!, 72)).toBe(false); // a departure still fails it
    // The first read that does carry one starts the clock: 72 h from it, not from the undesignated read.
    const designated = mergeReadings(day3, uploads, [read("v1", "false", at(96))], at(96));
    expect(designated.videos[0]!.firstDesignationAt).toBe(at(96));
    expect(designated.videos[0]!.p2ClockAt).toBe(at(96));
    expect(stayedPublic(designated.videos[0]!, 72)).toBeNull();
    const later = mergeReadings(designated, uploads, [read("v1", "false", at(167))], at(167));
    expect(stayedPublic(later.videos[0]!, 72)).toBeNull();
    const window = mergeReadings(designated, uploads, [read("v1", "false", at(168))], at(168));
    expect(stayedPublic(window.videos[0]!, 72)).toBe(true);
  });

  it("p2ClockAt stays null for the entry's life when the first designation read was not public (ruling 12.10 row 28 §2 decisions 2-3)", () => {
    // Today's stayedPublic read `first.privacyStatus !== "public"` → null for good: the clock never starts on a later
    // public read. p2ClockAt is written only in the merge that writes firstDesignationAt.
    const uploads = [{ id: "v1" }];
    const at = (h: number) => new Date(Date.parse(T0) + h * 3_600_000).toISOString();
    const privateFirst = mergeReadings(emptyState("faceless-youtube"), uploads, [read("v1", "false", at(0), "private")], at(0));
    expect(privateFirst.videos[0]!.firstDesignationAt).toBe(at(0));
    expect(privateFirst.videos[0]!.p2ClockAt).toBeNull();
    const publicLater = mergeReadings(privateFirst, uploads, [read("v1", "false", at(24))], at(24));
    expect(publicLater.videos[0]!.p2ClockAt).toBeNull(); // a later public designated read does not set it
    expect(publicLater.videos[0]!.lastPublicAt).toBe(at(24));
    expect(publicLater.videos[0]!.leftPublicAt).toBeNull(); // private, then public: no departure from public
    const muchLater = mergeReadings(publicLater, uploads, [read("v1", "false", at(200))], at(200));
    expect(muchLater.videos[0]!.p2ClockAt).toBeNull();
    expect(stayedPublic(muchLater.videos[0]!, 72)).toBeNull(); // 176 h public, never true: the clock never started
    // An undesignated private read first, then a designated public one: the clock starts at the designated read.
    const undesignatedPrivate = mergeReadings(emptyState("faceless-youtube"), uploads, [read("v1", null, at(0), "private")], at(0));
    const startsHere = mergeReadings(undesignatedPrivate, uploads, [read("v1", "false", at(5))], at(5));
    expect(startsHere.videos[0]!.p2ClockAt).toBe(at(5));
  });

  it("lastPublicAt is refreshed by every run that finds the upload public, and leftPublicAt is set from the prior lastPublicAt", () => {
    const uploads = [{ id: "v1" }];
    const at = (h: number) => new Date(Date.parse(T0) + h * 3_600_000).toISOString();
    const s0 = mergeReadings(emptyState("kids-explainers"), uploads, [read("v1", "true", at(0))], at(0));
    const s1 = mergeReadings(s0, uploads, [read("v1", "true", at(10))], at(10));
    const s2 = mergeReadings(s1, uploads, [read("v1", null, at(20))], at(20)); // public, no designation: still a public read
    expect([s0, s1, s2].map((s) => s.videos[0]!.lastPublicAt)).toEqual([at(0), at(10), at(20)]);
    expect(s2.videos[0]!.leftPublicAt).toBeNull();
    const s3 = mergeReadings(s2, uploads, [read("v1", "true", at(30), "unlisted")], at(30));
    expect(s3.videos[0]!.lastPublicAt).toBe(at(20)); // a read that is not public does not refresh it
    expect(s3.videos[0]!.leftPublicAt).toBe(at(30)); // a public read came before: the departure is recorded
    const s4 = mergeReadings(s3, uploads, [read("v1", "true", at(40))], at(40));
    expect(s4.videos[0]!.lastPublicAt).toBe(at(40));
    expect(s4.videos[0]!.leftPublicAt).toBe(at(30)); // never cleared
    // With no public read before it, a read that is not public is no departure.
    const neverPublic = mergeReadings(emptyState("kids-explainers"), uploads, [read("v1", "true", at(0), "unlisted")], at(0));
    const stillNot = mergeReadings(neverPublic, uploads, [read("v1", "true", at(10), "private")], at(10));
    expect(stillNot.videos[0]!.lastPublicAt).toBeNull();
    expect(stillNot.videos[0]!.leftPublicAt).toBeNull();
  });

  it("readbackOf gives the line's own declaration from firstDesignationAt alone, and the contrary one from contradictedAt", () => {
    const uploads = [{ id: "v1" }];
    for (const line of ["faceless-youtube", "kids-explainers"] as const) {
      const declared = String(emptyState(line).declaresMadeForKids);
      const contrary = declared === "true" ? "false" : "true";
      const handMade = (o: Partial<UploadReadback>): MadeForKidsState => ({ ...emptyState(line), videos: [entry("v1", o)] });
      expect(readbackOf(handMade({ firstDesignationAt: T0 }), uploads), line).toEqual([declared]);
      expect(readbackOf(handMade({ firstReadAt: T0, firstReadReturned: true, p1Api: true, lastPublicAt: T0 }), uploads), line).toEqual([null]);
      expect(readbackOf(handMade({ firstDesignationAt: T0, contradictedAt: T1R }), uploads), line).toEqual([contrary]);
      expect(readbackOf(handMade({}), uploads), line).toEqual([null]);
    }
  });

  describe("feeds the experiment", () => {
    const base: Omit<ExperimentReadings, "madeForKidsReadback"> = {
      day: 20, t1Passed: true, videosPassedGate: 3, medianStrangerViews: null, strangerWatchHours28d: null,
      averageViewPercentage: null, policySignal: false, ungrantedRecurringCost: false,
      maxRunnerMinutesPerVideo: 20, maxTokenCostIlsPerVideo: 0,
    };

    it("the kids line: a false read-back is K-mfk-designation, an unread one freezes uploads", () => {
      const falseRead = mergeReadings(emptyState("kids-explainers"), [{ id: "kidsVid0002" }], parseVideosList(fixture("false"), ["kidsVid0002"], AT), AT);
      expect(evaluateExperiment(KIDS_EXPLAINERS_EXPERIMENT, { ...base, madeForKidsReadback: readbackOf(falseRead, [{ id: "kidsVid0002" }]) }).triggered).toContain("K-mfk-designation");
      const unread = mergeReadings(emptyState("kids-explainers"), [{ id: "kidsVid0003" }], parseVideosList(fixture("missing"), ["kidsVid0003"], AT), AT);
      const v = evaluateExperiment(KIDS_EXPLAINERS_EXPERIMENT, { ...base, madeForKidsReadback: readbackOf(unread, [{ id: "kidsVid0003" }]) });
      expect(v.triggered).toEqual(["K-mfk-unmeasured"]);
      expect(v.uploadsFrozen).toBe(true);
    });

    it("T1's line: the reader's output alone clears the gate, and an override it sees later flags the board", () => {
      const uploads = [{ id: "t1Video001" }];
      const first = mergeReadings(emptyState("faceless-youtube"), uploads, [read("t1Video001", "false", T0)], T0);
      const clear = evaluateExperiment(FACELESS_YOUTUBE_EXPERIMENT, { ...base, madeForKidsReadback: readbackOf(first, uploads) });
      expect(clear.decision).toBe("continue");
      expect(clear.uploadsFrozen).toBe(false);
      const later = mergeReadings(first, uploads, [read("t1Video001", "true", T1R)], T1R);
      const flagged = evaluateExperiment(FACELESS_YOUTUBE_EXPERIMENT, { ...base, madeForKidsReadback: readbackOf(later, uploads) });
      expect(flagged.triggered).toEqual(["K-mfk-override"]);
    });

    it("an upload the reader has not run on since is unread: frozen, not skipped", () => {
      const uploads = [{ id: "t1Video001" }, { id: "t1Video002" }];
      const state = mergeReadings(emptyState("faceless-youtube"), uploads.slice(0, 1), [read("t1Video001", "false", T0)], T0);
      const v = evaluateExperiment(FACELESS_YOUTUBE_EXPERIMENT, { ...base, madeForKidsReadback: readbackOf(state, uploads) });
      expect(v.triggered).toEqual(["K-mfk-unmeasured"]);
      expect(v.uploadsFrozen).toBe(true);
    });
  });
});

describe("firstUploadWindow: P1-P4 and t1Passed from the read-back state (ruling 7.10 row 24 §4 decision 3)", () => {
  const T0 = "2027-03-01T00:00:00.000Z";
  const at = (h: number) => new Date(Date.parse(T0) + h * 3_600_000).toISOString();
  /** One read of T1's first upload; with no privacyStatus it is a video the response did not return, unless `returned` says otherwise. */
  const read = (madeForKids: "true" | "false" | null, h: number, privacyStatus: string | null = "public", returned = privacyStatus !== null): MadeForKidsReading =>
    ({ id: "t1Video001", returned, madeForKids, privacyStatus, readAt: at(h) });
  const uploads = [{ id: "t1Video001" }];
  /** The read-back's entry for the first upload after these reads, one colony run each. */
  const after = (...reads: MadeForKidsReading[]): UploadReadback =>
    reads.reduce((s, r) => mergeReadings(s, uploads, [r], r.readAt), emptyState("faceless-youtube")).videos[0]!;

  const stayed = after(read("false", 0), read("false", 24), read("false", 72)); // public from the first read to +72 h
  const early = after(read("false", 0), read("false", 24)); // public, not yet 72 h
  const privated = after(read("false", 0), read("false", 30, "private")); // public, then private at +30 h
  const firstPrivate = after(read("false", 0, "private"));
  const firstUnlisted = after(read("false", 0, "unlisted"));
  const undesignated = after(read(null, 0)); // public, but no madeForKids: no first designation read
  const notReturned = after(read(null, 0, null));

  it("P1 is true when the publisher accepted the upload and the first read found it public", () => {
    expect(firstUploadWindow(stayed, true, true, true).p1).toBe(true);
    expect(firstUploadWindow(early, true, null, null).p1).toBe(true);
    expect(firstUploadWindow(privated, true, null, null).p1).toBe(true); // a later departure is P2's, not P1's
  });

  it("P1 is false when the publisher did not accept the upload, whatever the read says", () => {
    expect(firstUploadWindow(stayed, false, true, true).p1).toBe(false);
    expect(firstUploadWindow(null, false, true, true).p1).toBe(false);
  });

  it("P1 is false when the first read found the upload private or unlisted, whatever the publisher said", () => {
    for (const entry of [firstPrivate, firstUnlisted]) {
      expect(firstUploadWindow(entry, true, true, true).p1).toBe(false);
      expect(firstUploadWindow(entry, null, true, true).p1).toBe(false);
    }
  });

  it("P1 is null while either half is unread", () => {
    expect(firstUploadWindow(stayed, null, true, true).p1).toBeNull(); // no publisher response recorded
    expect(firstUploadWindow(null, true, true, true).p1).toBeNull(); // no read yet
    const neverAsked: UploadReadback = {
      id: "t1Video001", firstReadAt: null, firstReadReturned: null, p1Api: null, firstDesignationAt: null, p2ClockAt: null,
      lastPublicAt: null, leftPublicAt: null, contradictedAt: null,
    };
    expect(firstUploadWindow(neverAsked, true, true, true).p1).toBeNull(); // an entry no read has reached yet
    expect(firstUploadWindow(undesignated, null, true, true).p1).toBeNull(); // the publisher's half unread
  });

  it("P1 reads the first read, designated or not (amendment 1): an undesignated public one is true, a not-returned one false", () => {
    // Re-pinned by ruling 7.10 row 24 amendment 1. Until it, both of these read null: P1 read the first designation read
    // (`first`), and neither entry has one. P1 now reads the first read whatever it carried (since ruling 12.10 row 28 §2
    // the state keeps that read's answer, `p1Api`, not its privacyStatus).
    expect(firstUploadWindow(undesignated, true, true, true).p1).toBe(true);
    expect(firstUploadWindow(notReturned, true, true, true).p1).toBe(false);
  });

  it("P2 is stayedPublic(entry, hours): true at 72 h, false on a departure, null before 72 h or with no entry", () => {
    expect(firstUploadWindow(stayed, true, true, true).p2).toBe(true);
    expect(firstUploadWindow(privated, true, true, true).p2).toBe(false);
    expect(firstUploadWindow(early, true, true, true).p2).toBeNull();
    expect(firstUploadWindow(null, true, true, true).p2).toBeNull();
    for (const entry of [stayed, privated, early, firstPrivate, undesignated]) {
      expect(firstUploadWindow(entry, true, true, true).p2).toBe(stayedPublic(entry, 72));
    }
  });

  it("P2's window is 72 hours unless the caller says otherwise", () => {
    expect(firstUploadWindow(after(read("false", 0), read("false", 71)), true, true, true).p2).toBeNull();
    expect(firstUploadWindow(after(read("false", 0), read("false", 72)), true, true, true).p2).toBe(true);
    expect(firstUploadWindow(early, true, true, true, 24).p2).toBe(true);
  });

  it("P3 and P4 are the caller's readings, passed through as true, false or null", () => {
    for (const r of [true, false, null]) {
      expect(firstUploadWindow(stayed, true, r, true).p3).toBe(r);
      expect(firstUploadWindow(stayed, true, true, r).p4).toBe(r);
    }
  });

  it("passed is true only when all four readings are true", () => {
    expect(firstUploadWindow(stayed, true, true, true)).toEqual({ p1: true, p2: true, p3: true, p4: true, passed: true });
  });

  it("passed is false when any one reading is false, whatever the others", () => {
    expect(firstUploadWindow(stayed, false, true, true).passed).toBe(false); // P1, the publisher's half
    expect(firstUploadWindow(firstPrivate, true, true, true).passed).toBe(false); // P1, the read's half
    expect(firstUploadWindow(privated, true, true, true).passed).toBe(false); // P2
    expect(firstUploadWindow(stayed, true, false, true).passed).toBe(false); // P3
    expect(firstUploadWindow(stayed, true, true, false).passed).toBe(false); // P4
    expect(firstUploadWindow(early, null, false, null)).toEqual({ p1: null, p2: null, p3: false, p4: null, passed: false });
  });

  it("passed is null while any reading is unread and none is false", () => {
    expect(firstUploadWindow(stayed, null, true, true).passed).toBeNull(); // P1
    expect(firstUploadWindow(early, true, true, true).passed).toBeNull(); // P2
    expect(firstUploadWindow(stayed, true, null, true).passed).toBeNull(); // P3
    expect(firstUploadWindow(stayed, true, true, null).passed).toBeNull(); // P4
    expect(firstUploadWindow(undesignated, true, true, true).passed).toBeNull(); // never true on an undesignated read
  });

  it("with no entry (nothing read yet) P1 and P2 are unread, so it never passes; the publisher's no still fails it", () => {
    expect(firstUploadWindow(null, null, null, null)).toEqual({ p1: null, p2: null, p3: null, p4: null, passed: null });
    expect(firstUploadWindow(null, true, true, true)).toEqual({ p1: null, p2: null, p3: true, p4: true, passed: null });
    expect(firstUploadWindow(null, false, null, null)).toEqual({ p1: false, p2: null, p3: null, p4: null, passed: false });
  });

  it("is pure: it changes nothing it is given and answers the same twice", () => {
    const copy = structuredClone(privated);
    const once = firstUploadWindow(privated, true, true, true);
    expect(firstUploadWindow(privated, true, true, true)).toEqual(once);
    expect(privated).toEqual(copy);
  });

  it("is t1Passed: its false is K-T1 on T1's line and K-T1k on the kids line", () => {
    const base: Omit<ExperimentReadings, "t1Passed"> = {
      day: 3, videosPassedGate: 1, medianStrangerViews: null, strangerWatchHours28d: null, averageViewPercentage: null,
      policySignal: false, ungrantedRecurringCost: false, maxRunnerMinutesPerVideo: 20, maxTokenCostIlsPerVideo: 0,
      madeForKidsReadback: ["false"],
    };
    const t1Passed = firstUploadWindow(privated, true, true, true).passed;
    expect(evaluateExperiment(FACELESS_YOUTUBE_EXPERIMENT, { ...base, t1Passed }).triggered).toContain("K-T1");
    expect(evaluateExperiment(KIDS_EXPLAINERS_EXPERIMENT, { ...base, t1Passed, madeForKidsReadback: ["true"] }).triggered).toContain("K-T1k");
  });
});

describe("the first read: P1 reads the first read, designated or not (ruling 7.10 row 24 amendment 1)", () => {
  const T0 = "2027-03-01T00:00:00.000Z";
  const at = (h: number) => new Date(Date.parse(T0) + h * 3_600_000).toISOString();
  const uploads = [{ id: "t1Video001" }];
  /** One read of T1's first upload; with no privacyStatus it is a video the response did not return, unless `returned` says otherwise. */
  const read = (madeForKids: "true" | "false" | null, h: number, privacyStatus: string | null = "public", returned = privacyStatus !== null): MadeForKidsReading =>
    ({ id: "t1Video001", returned, madeForKids, privacyStatus, readAt: at(h) });
  /** The read-back's entry for the first upload after these reads, one colony run each. */
  const after = (...reads: MadeForKidsReading[]): UploadReadback =>
    reads.reduce((s, r) => mergeReadings(s, uploads, [r], r.readAt), emptyState("faceless-youtube")).videos[0]!;
  /**
   * What the entry keeps of its first read (ruling 12.10 row 28 §2 decision 2): when it was taken, whether it returned the
   * video, and P1's API half judged at it — the three fields written once, in place of the read's own privacyStatus.
   */
  const firstReadOf = (v: UploadReadback) => ({ firstReadAt: v.firstReadAt, firstReadReturned: v.firstReadReturned, p1Api: v.p1Api });

  it("regression, the measured fixture: a not-returned first read, then designated public reads at +1 h and +73 h, fails P1 and the window (before amendment 1 it passed)", () => {
    // fold 2's builder and reviewer measured this one: until amendment 1 it gave { p1: true, p2: true, ..., passed: true },
    // because P1 read `first`, and the +1 h read was the first one that carried a designation.
    const entry = after(read(null, 0, null), read("false", 1), read("false", 73));
    expect(firstReadOf(entry)).toEqual({ firstReadAt: at(0), firstReadReturned: false, p1Api: false });
    expect(entry.firstDesignationAt).toBe(at(1)); // the first designation read keeps its meaning
    expect(entry.p2ClockAt).toBe(at(1));
    expect(entry.leftPublicAt).toBeNull();
    expect(stayedPublic(entry, 72)).toBe(true); // P2's clock still starts at the first designation read (§4 decisions 1-2 stand)
    expect(firstUploadWindow(entry, true, true, true)).toEqual({ p1: false, p2: true, p3: true, p4: true, passed: false });
  });

  it("regression: an undesignated private first read, then designated public reads at +1 h and +73 h, fails P1 and the window (before amendment 1 it passed)", () => {
    const entry = after(read(null, 0, "private"), read("false", 1), read("false", 73));
    expect(firstReadOf(entry)).toEqual({ firstReadAt: at(0), firstReadReturned: true, p1Api: false });
    expect(firstUploadWindow(entry, true, true, true)).toEqual({ p1: false, p2: true, p3: true, p4: true, passed: false });
  });

  it("the not-returned case records returned false and P1's API half false, from the parser's own reading", () => {
    const ids = ["kidsVid0003", "kidsVid0004"];
    const state = mergeReadings(emptyState("kids-explainers"), ids.map((id) => ({ id })), parseVideosList(fixture("missing"), ids, AT), AT);
    expect(state.videos.map(firstReadOf)).toEqual([
      { firstReadAt: AT, firstReadReturned: false, p1Api: false }, // not in the response
      { firstReadAt: AT, firstReadReturned: true, p1Api: false }, // in it, with no madeForKids, private: judged, not kept
    ]);
    for (const v of state.videos) expect(firstUploadWindow(v, true, true, true).p1, v.id).toBe(false);
  });

  it("a video the response returned with no privacyStatus is returned, its status read null, and fails P1", () => {
    const [r] = parseVideosList({ items: [{ id: "t1Video001", status: { madeForKids: false } }] }, ["t1Video001"], at(0));
    expect(r).toEqual({ id: "t1Video001", returned: true, madeForKids: "false", privacyStatus: null, readAt: at(0) });
    const entry = after(r!);
    expect(firstReadOf(entry)).toEqual({ firstReadAt: at(0), firstReadReturned: true, p1Api: false });
    expect(firstUploadWindow(entry, true, true, true).p1).toBe(false);
  });

  it("the first read is written once: a later run never changes it, whatever that run reads", () => {
    const fr = { firstReadAt: at(0), firstReadReturned: true, p1Api: true };
    expect(firstReadOf(after(read(null, 0)))).toEqual(fr);
    for (const later of [read("false", 1, "private"), read(null, 2, null), read("true", 3, "unlisted"), read("false", 80)]) {
      expect(firstReadOf(after(read(null, 0), later)), later.readAt).toEqual(fr);
    }
    expect(firstReadOf(after(read(null, 0), read("false", 1, "private"), read("false", 80)))).toEqual(fr);
    const gone = { firstReadAt: at(0), firstReadReturned: false, p1Api: false };
    expect(firstReadOf(after(read(null, 0, null), read("false", 1), read("false", 2)))).toEqual(gone);
  });

  it("a listed upload a run did not read keeps its entry as it was: no read, so no first read recorded", () => {
    const both = [{ id: "a" }, { id: "b" }];
    const r = (id: string, h: number, returned: boolean): MadeForKidsReading =>
      ({ id, returned, madeForKids: returned ? "false" : null, privacyStatus: returned ? "public" : null, readAt: at(h) });
    const s0 = mergeReadings(emptyState("faceless-youtube"), both, [r("a", 0, true)], at(0));
    expect(s0.videos[1]).toEqual({
      id: "b", firstReadAt: null, firstReadReturned: null, p1Api: null, firstDesignationAt: null, p2ClockAt: null,
      lastPublicAt: null, leftPublicAt: null, contradictedAt: null,
    });
    const s1 = mergeReadings(s0, both, [r("b", 1, false)], at(1));
    expect(s1.videos[0]).toEqual(s0.videos[0]); // a was not read at +1 h
    expect(firstReadOf(s1.videos[1]!)).toEqual({ firstReadAt: at(1), firstReadReturned: false, p1Api: false });
  });

  it("an undesignated public first read gives P1 true, while P2 stays null until a designation read starts its clock", () => {
    const undesignated = after(read(null, 0));
    expect(undesignated.firstDesignationAt).toBeNull();
    expect(firstUploadWindow(undesignated, true, true, true)).toEqual({ p1: true, p2: null, p3: true, p4: true, passed: null });
    const still = after(read(null, 0), read(null, 72), read(null, 144));
    expect(firstUploadWindow(still, true, true, true)).toEqual({ p1: true, p2: null, p3: true, p4: true, passed: null });
    const designated = after(read(null, 0), read(null, 72), read("false", 80));
    expect(firstUploadWindow(designated, true, true, true).p2).toBeNull(); // the clock starts at +80 h
    const window = after(read(null, 0), read(null, 72), read("false", 80), read("false", 152));
    expect(firstUploadWindow(window, true, true, true)).toEqual({ p1: true, p2: true, p3: true, p4: true, passed: true });
    expect(firstUploadWindow(undesignated, null, true, true).p1).toBeNull(); // no publisher response recorded
  });

  it("a first read that says not returned fails P1 on that alone, whatever privacyStatus a hand-edited state gives it", () => {
    // The hand-edited first read { returned: false, privacyStatus: "public" }, in the state's shape since ruling 12.10 row
    // 28 §2: P1's API half is "returned and public", judged at that read, so it is false.
    const edited: UploadReadback = { ...after(read("false", 0), read("false", 72)), firstReadReturned: false, p1Api: false };
    expect(firstUploadWindow(edited, true, true, true)).toEqual({ p1: false, p2: true, p3: true, p4: true, passed: false });
    // The same hand edit made on the reading the merge is given: not returned fails P1's API half whatever privacyStatus
    // says (the parser never gives both; a hand-made reading can).
    const handRead = after(read("false", 0, "public", false), read("false", 72));
    expect(firstReadOf(handRead)).toEqual({ firstReadAt: at(0), firstReadReturned: false, p1Api: false });
    expect(firstUploadWindow(handRead, true, true, true)).toEqual({ p1: false, p2: true, p3: true, p4: true, passed: false });
  });
});

describe("the script (scripts/youtube-madeforkids-readback.ts), offline", () => {
  function setup(uploads: { id: string }[] | null, prior: MadeForKidsState | null = null, verdicts: string | null = JSON.stringify(verdictsWith("NOT_BARRED"))) {
    const dir = mkdtempSync(join(tmpdir(), "mfk-"));
    const videosPath = join(dir, "videos.json");
    const statePath = join(dir, "state.json");
    const verdictsPath = join(dir, "terms-verdicts.json");
    if (uploads) writeFileSync(videosPath, JSON.stringify(uploads));
    if (prior) writeFileSync(statePath, JSON.stringify(prior));
    if (verdicts !== null) writeFileSync(verdictsPath, verdicts);
    const lines: string[] = [];
    const calls: string[] = [];
    const inits: ({ signal?: AbortSignal; redirect?: "error" } | undefined)[] = [];
    const answers: Record<string, unknown> = {};
    const fetchImpl = async (url: string, init?: { signal?: AbortSignal; redirect?: "error" }) => {
      calls.push(url);
      inits.push(init);
      const ids = new URL(url).searchParams.get("id") ?? "";
      const body = answers[ids];
      if (body === undefined) return { status: 500, text: async () => "unexpected request" };
      return { status: (body as { error?: { code: number } }).error?.code ?? 200, text: async () => JSON.stringify(body) };
    };
    return { dir, videosPath, statePath, verdictsPath, lines, calls, inits, answers, fetchImpl, log: (s: string) => lines.push(s) };
  }

  it("refuses to run without YOUTUBE_DATA_API_KEY: no request, no file", async () => {
    expect(API_KEY_ENV).toBe("YOUTUBE_DATA_API_KEY");
    const s = setup([{ id: "kidsVid0001" }]);
    for (const env of [{}, { [API_KEY_ENV]: "" }, { [API_KEY_ENV]: "   " }]) {
      const code = await runReadback({ env, fetchImpl: s.fetchImpl, experiment: "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, verdictsPath: s.verdictsPath, now: AT, log: s.log });
      expect(code).toBe(2);
    }
    expect(s.calls).toEqual([]);
    expect(existsSync(s.statePath)).toBe(false);
    expect(s.lines.join("\n")).toMatch(/YOUTUBE_DATA_API_KEY is not set/);
  });

  it("reads every upload, writes their readings, and never prints the key", async () => {
    const s = setup([{ id: "kidsVid0001" }, { id: "kidsVid0002" }, { id: "kidsVid0003" }, { id: "kidsVid0004" }]);
    s.answers["kidsVid0001,kidsVid0002,kidsVid0003,kidsVid0004"] = {
      items: [fixture("true").items[0], fixture("false").items[0], fixture("missing").items[0]],
    };
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, verdictsPath: s.verdictsPath, now: AT, log: s.log });
    expect(code).toBe(0);
    expect(s.calls).toHaveLength(1);
    expect(new URL(s.calls[0]!).hostname).toBe("www.googleapis.com");
    const written = readFileSync(s.statePath, "utf8");
    const state = JSON.parse(written) as MadeForKidsState;
    expect(state.experiment).toBe("kids-explainers");
    expect(readbackOf(state, [{ id: "kidsVid0001" }, { id: "kidsVid0002" }, { id: "kidsVid0003" }, { id: "kidsVid0004" }])).toEqual(["true", "false", null, null]);
    // The colony's own facts about the four reads (ruling 12.10 row 28 §2): the times, and the answers to its checks.
    expect(state.videos.map((v) => v.lastPublicAt)).toEqual([AT, AT, null, null]);
    expect(state.videos.map((v) => v.firstReadAt)).toEqual([AT, AT, AT, AT]);
    expect(state.videos.map((v) => [v.firstReadReturned, v.p1Api])).toEqual([
      [true, true],
      [true, true],
      [false, false], // not in the response
      [true, false], // in it, private
    ]);
    expect(state.videos.map((v) => v.firstDesignationAt)).toEqual([AT, AT, null, null]);
    expect(state.videos.map((v) => v.contradictedAt)).toEqual([null, AT, null, null]);
    // The written file passes the invariant: no value the API returned is in it.
    expect(nonColonyLeaves(state)).toEqual([]);
    expect(() => assertColonyFactsOnly(state)).not.toThrow();
    for (const word of API_WORDS) expect(written, word).not.toContain(`"${word}"`);
    // The summary says, per upload, as-declared, contrary or unread (§2 decision 4), never a designation or a status.
    const said = s.lines.join("\n");
    expect(said).toContain("read-back as-declared, contrary, unread, unread;");
    expect(said).toContain("(declares made for kids: true)"); // the line's own declaration, not a read value
    const readValues = said.split(s.statePath).join("").replace("(declares made for kids: true)", "");
    expect(readValues).not.toMatch(/\b(public|private|unlisted|true|false)\b/);
    expect(said).not.toContain(KEY);
    expect(written).not.toContain(KEY);
  });

  it("re-reads an upload that already has a reading, keeping the first and recording the latest", async () => {
    // T1's line, read false on 1.3; on 11.3 YouTube has set it to made for kids. A reader that asked only about unread
    // uploads would never see it (the 4.10 review): P-2 counts overrides "when YouTube sets them".
    const EARLIER = "2027-03-01T06:00:00.000Z";
    const earlierFirstRead = { firstReadAt: EARLIER, firstReadReturned: true, p1Api: true };
    const prior: MadeForKidsState = {
      ...emptyState("faceless-youtube"),
      updatedAt: EARLIER,
      videos: [{
        id: "kidsVid0001", ...earlierFirstRead, firstDesignationAt: EARLIER, p2ClockAt: EARLIER, lastPublicAt: EARLIER,
        leftPublicAt: null, contradictedAt: null,
      }],
    };
    const s = setup([{ id: "kidsVid0001" }], prior);
    s.answers.kidsVid0001 = fixture("true");
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "faceless-youtube", videosPath: s.videosPath, statePath: s.statePath, verdictsPath: s.verdictsPath, now: AT, log: s.log });
    expect(code).toBe(0);
    expect(s.calls).toHaveLength(1);
    const state = JSON.parse(readFileSync(s.statePath, "utf8")) as MadeForKidsState;
    const v = state.videos[0]!;
    expect([v.firstDesignationAt, v.p2ClockAt]).toEqual([EARLIER, EARLIER]); // the first designation read, kept
    expect({ firstReadAt: v.firstReadAt, firstReadReturned: v.firstReadReturned, p1Api: v.p1Api }).toEqual(earlierFirstRead); // written once, at the first run (amendment 1)
    expect(v.lastPublicAt).toBe(AT); // the latest read, public
    expect(v.contradictedAt).toBe(AT);
    expect(readbackOf(state, [{ id: "kidsVid0001" }])).toEqual(["true"]);
    expect(s.lines.join("\n")).toContain("read-back contrary;");
  });

  it("refuses to write a state that is not colony facts only: exit 1, the file left as it was (ruling 12.10 row 28 fold 3)", async () => {
    // A state file written before the ruling would carry the API's values; an upload no longer listed keeps its entry as
    // it was, so the merged state would carry them on. assertColonyFactsOnly runs before the write and stops it.
    const old = { id: "oldVid0001", returned: true, madeForKids: "false", privacyStatus: "public", readAt: "2027-02-01T06:00:00.000Z" };
    const prior = {
      ...emptyState("faceless-youtube"),
      videos: [{ id: "oldVid0001", firstRead: { readAt: old.readAt, returned: true, privacyStatus: "public" }, first: old, latest: old, contradictedAt: null, leftPublicAt: null }],
    } as unknown as MadeForKidsState;
    const s = setup([{ id: "kidsVid0001" }], prior);
    const before = readFileSync(s.statePath, "utf8");
    s.answers.kidsVid0001 = fixture("false");
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "faceless-youtube", videosPath: s.videosPath, statePath: s.statePath, verdictsPath: s.verdictsPath, now: AT, log: s.log });
    expect(code).toBe(1);
    expect(s.calls).toHaveLength(1);
    expect(readFileSync(s.statePath, "utf8")).toBe(before);
    const said = s.lines.join("\n");
    expect(said).toMatch(/not a colony fact at state\.videos\[1\]\.firstRead\.privacyStatus/);
    expect(said).toMatch(/nothing written/);
    expect(said).not.toMatch(/\b(public|private|unlisted|true|false)\b/); // the path is named, never the value
  });

  it("asks nothing when the uploads list is empty", async () => {
    const s = setup([]);
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, verdictsPath: s.verdictsPath, now: AT, log: s.log });
    expect(code).toBe(0);
    expect(s.calls).toEqual([]);
  });

  it("asks nothing when nothing has been uploaded", async () => {
    const s = setup(null);
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, verdictsPath: s.verdictsPath, now: AT, log: s.log });
    expect(code).toBe(0);
    expect(s.calls).toEqual([]);
    expect(existsSync(s.statePath)).toBe(false);
  });

  it("batches at most 50 ids a call", async () => {
    const uploads = Array.from({ length: 51 }, (_, i) => ({ id: `kidsVid${String(i).padStart(4, "0")}` }));
    const s = setup(uploads);
    s.answers[uploads.slice(0, 50).map((u) => u.id).join(",")] = { items: [] };
    s.answers[uploads[50]!.id] = { items: [] };
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, verdictsPath: s.verdictsPath, now: AT, log: s.log });
    expect(code).toBe(0);
    expect(s.calls).toHaveLength(2);
  });

  it("fails on an API error without writing, and redacts the key from what it prints", async () => {
    const s = setup([{ id: "kidsVid0001" }]);
    s.answers.kidsVid0001 = { error: { code: 403, message: `API key ${KEY} not valid` } };
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, verdictsPath: s.verdictsPath, now: AT, log: s.log });
    expect(code).toBe(1);
    expect(existsSync(s.statePath)).toBe(false);
    expect(s.lines.join("\n")).toMatch(/HTTP 403/);
    expect(s.lines.join("\n")).not.toContain(KEY);
  });

  it("refuses a line it does not know", async () => {
    const s = setup([{ id: "kidsVid0001" }]);
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "kids-shorts" as "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, verdictsPath: s.verdictsPath, now: AT, log: s.log });
    expect(code).toBe(2);
    expect(s.calls).toEqual([]);
  });

  it("keeps each line's uploads and readings in its own files", () => {
    expect(defaultPaths("faceless-youtube")).toEqual({
      videosPath: "state/colony/measurements/youtube-videos.json",
      statePath: "state/colony/measurements/faceless-youtube-madeforkids.json",
    });
    expect(defaultPaths("kids-explainers")).toEqual({
      videosPath: "state/colony/measurements/kids-explainers-videos.json",
      statePath: "state/colony/measurements/kids-explainers-madeforkids.json",
    });
  });
});

describe("no live call before Stage A (ruling 4.10 fold 7)", () => {
  const script = readFileSync(resolve(ROOT, "scripts/youtube-madeforkids-readback.ts"), "utf8");

  it("no workflow runs the read-back, and no package script does", () => {
    const dir = resolve(ROOT, ".github/workflows");
    const workflows = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));
    expect(workflows.length).toBeGreaterThan(5);
    for (const f of workflows) expect(readFileSync(join(dir, f), "utf8"), f).not.toMatch(/youtube-madeforkids/);
    expect(readFileSync(resolve(ROOT, "package.json"), "utf8")).not.toMatch(/youtube-madeforkids/);
  });

  it("carries no key: it reads the environment, documents the variable in its header, and hard-codes nothing", () => {
    expect(script).toContain("YOUTUBE_DATA_API_KEY");
    expect(script).not.toMatch(/AIza[0-9A-Za-z_-]{20,}/); // the shape of a Google API key
    expect(script.slice(0, script.indexOf("*/"))).toMatch(/YOUTUBE_DATA_API_KEY/);
  });

  it("its header names both gates: the googleapis.com terms verdict and the key", () => {
    const header = script.slice(0, script.indexOf("*/"));
    expect(header).toMatch(/Two gates/);
    expect(header).toMatch(/terms-verdicts\.json/);
    expect(header).toMatch(/googleapis\.com entry/);
    expect(header).toMatch(/ACTIVE_VERDICTS/);
    expect(header).toMatch(/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand\.md/);
    expect(header).toMatch(/redirect: "error"/);
  });

  it("its WRITES paragraph describes the colony-facts state and says no API value is written (ruling 12.10 row 28 fold 3)", () => {
    const header = script.slice(0, script.indexOf("*/"));
    const writes = header.slice(header.indexOf(" * WRITES"), header.indexOf("NO LIVE CALL"));
    expect(writes.length).toBeGreaterThan(0);
    expect(writes).toMatch(/no value the API returned/);
    expect(writes).toMatch(/assertColonyFactsOnly/);
    expect(writes).toMatch(/RULING-2026-10-12-youtube-derived-metrics\.md/);
    expect(writes).toMatch(/as-declared, contrary or unread/);
    expect(writes).not.toMatch(/madeForKids "true"\/"false"/); // the shape before the ruling
  });
});

describe("the terms gate: no call until the API's terms are read (ruling 7.10 row 24 (b), decision 2)", () => {
  function setup(verdicts: string | null) {
    const dir = mkdtempSync(join(tmpdir(), "mfk-terms-"));
    const videosPath = join(dir, "videos.json");
    const statePath = join(dir, "state.json");
    const verdictsPath = join(dir, "terms-verdicts.json");
    writeFileSync(videosPath, JSON.stringify([{ id: "kidsVid0001" }]));
    if (verdicts !== null) writeFileSync(verdictsPath, verdicts);
    const lines: string[] = [];
    const calls: string[] = [];
    const inits: ({ signal?: AbortSignal; redirect?: "error" } | undefined)[] = [];
    const fetchImpl = async (url: string, init?: { signal?: AbortSignal; redirect?: "error" }) => {
      calls.push(url);
      inits.push(init);
      return { status: 200, text: async () => JSON.stringify(fixture("true")) };
    };
    const run = (env: Record<string, string | undefined> = { [API_KEY_ENV]: KEY }) =>
      runReadback({ env, fetchImpl, experiment: "kids-explainers", videosPath, statePath, verdictsPath, now: AT, log: (s) => lines.push(s) });
    return { statePath, verdictsPath, lines, calls, inits, run };
  }

  it("refuses with a verdicts file that has no googleapis.com entry, even with the key: no request, no file", async () => {
    const s = setup(JSON.stringify(verdictsWith(null)));
    expect(await s.run()).toBe(2);
    expect(s.calls).toEqual([]);
    expect(existsSync(s.statePath)).toBe(false);
    expect(s.lines.join("\n")).toMatch(/there is no googleapis\.com entry in .*terms-verdicts\.json — refusing to run/);
    expect(s.lines.join("\n")).toMatch(/ruling 7\.10 row 24 \(b\)/);
  });

  it("refuses under CONDITIONAL_UNMET, and under every verdict that is not active", async () => {
    for (const verdict of ["CONDITIONAL_UNMET", "BARRED", "TERMS_PENDING", "NO_TERMS", "UNKNOWN"]) {
      const s = setup(JSON.stringify(verdictsWith(verdict)));
      expect(await s.run(), verdict).toBe(2);
      expect(s.calls, verdict).toEqual([]);
      expect(existsSync(s.statePath), verdict).toBe(false);
      expect(s.lines.join("\n"), verdict).toContain(`googleapis.com is ${verdict}, not one a call may run under`);
    }
  });

  it("says what the refusal waits for since the 7.10 read: an active-eligible verdict, with the unmet conditions' file", async () => {
    // Tick 62 (7.10.2026): the refusal said no call is made "until the YouTube API Services Terms are read at github grade
    // and recorded there"; they were read on 7.10 (tick 61) and recorded CONDITIONAL_UNMET, so it names what is missing now.
    const s = setup(JSON.stringify(verdictsWith("CONDITIONAL_UNMET")));
    expect(await s.run()).toBe(2);
    const said = s.lines.join("\n");
    expect(said).toContain("No call is made until googleapis.com's verdict there is active-eligible (ruling 7.10 row 24 (b))");
    expect(said).toContain(`the conditions the 7.10 read found unmet are listed in ${API_TERMS_EXCERPT}; nothing asked, nothing written.`);
    expect(said).not.toContain("until the YouTube API Services Terms are read");
    expect(API_TERMS_EXCERPT).toBe("research/channel-loop/terms/youtube-api-services-terms-2026-10-07.md");
    expect(existsSync(resolve(ROOT, API_TERMS_EXCERPT))).toBe(true);
    // The file it names is the one the committed googleapis.com verdict cites, and it lists the unmet conditions.
    const committed = (readTermsVerdicts() as { sites: Record<string, { source: string }> }).sites["googleapis.com"];
    expect(committed.source.startsWith(`${API_TERMS_EXCERPT} (`)).toBe(true);
    expect(readFileSync(resolve(ROOT, API_TERMS_EXCERPT), "utf8")).toContain("conditions unmet");
  });

  it("fails closed on a missing or unreadable verdicts file", async () => {
    for (const verdicts of [null, "{ not json", "null", JSON.stringify({ sites: null }), JSON.stringify({ _about: "no sites" })]) {
      const s = setup(verdicts);
      expect(await s.run(), String(verdicts)).toBe(2);
      expect(s.calls, String(verdicts)).toEqual([]);
      expect(existsSync(s.statePath), String(verdicts)).toBe(false);
    }
  });

  it("with NOT_BARRED (or CONDITIONAL_MET) the key gate applies next", async () => {
    for (const verdict of ["NOT_BARRED", "CONDITIONAL_MET"]) {
      const s = setup(JSON.stringify(verdictsWith(verdict)));
      expect(await s.run({}), verdict).toBe(2);
      expect(s.calls, verdict).toEqual([]);
      expect(s.lines.join("\n"), verdict).toMatch(/YOUTUBE_DATA_API_KEY is not set/);
      expect(s.lines.join("\n"), verdict).not.toMatch(/terms-verdicts/);
      expect(await s.run(), verdict).toBe(0); // and with the key, it reads
      expect(s.calls, verdict).toHaveLength(1);
    }
  });

  it("checks the terms before the key: without either, it names the terms", async () => {
    const s = setup(JSON.stringify(verdictsWith(null)));
    expect(await s.run({})).toBe(2);
    expect(s.lines.join("\n")).toMatch(/no googleapis\.com entry/);
    expect(s.lines.join("\n")).not.toMatch(/YOUTUBE_DATA_API_KEY is not set/);
  });

  it("reads the verdicts as termsGate does: NO_TERMS_ROBOTS_OK counts only when scripts/robots-verdict.mjs set it", () => {
    expect(apiTermsGate(verdictsWith("NO_TERMS_ROBOTS_OK")).ok).toBe(false); // hand-set
    const scriptSet = verdictsWith("NO_TERMS_ROBOTS_OK", { note: "exhaustive-negative: fixture", source: "scripts/robots-verdict.mjs (fixture)" });
    expect(apiTermsGate(scriptSet)).toEqual({ ok: true, verdict: "NO_TERMS_ROBOTS_OK", why: "googleapis.com is NO_TERMS_ROBOTS_OK" });
    expect(apiTermsGate(verdictsWith("NOT_BARRED")).ok).toBe(true);
    expect(apiTermsGate(verdictsWith("CONDITIONAL_MET")).ok).toBe(true);
    expect(apiTermsGate(verdictsWith(null)).why).toBe("there is no googleapis.com entry");
    // Only the site's own entry counts: not a host under it, not another site's active verdict.
    expect(apiTermsGate({ sites: { "www.googleapis.com": { verdict: "NOT_BARRED" }, "github.com": { verdict: "NOT_BARRED" } } }).ok).toBe(false);
    expect(apiTermsGate({ sites: { "googleapis.com": { verdict: "NOT_BARRED" } } }).ok).toBe(true);
    expect(apiTermsGate({ sites: { "googleapis.com": {} } }).why).toBe("googleapis.com is an entry with no verdict, not one a call may run under");
    expect(API_TERMS_SITE).toBe("googleapis.com");
  });

  it("makes every request with redirect: \"error\", so a redirect is refused, never followed", async () => {
    const s = setup(JSON.stringify(verdictsWith("NOT_BARRED")));
    expect(await s.run()).toBe(0);
    expect(s.inits).toHaveLength(1);
    expect(s.inits[0]!.redirect).toBe("error");
    expect(s.inits[0]!.signal).toBeInstanceOf(AbortSignal);
  });

  it("a refused redirect is logged and nothing is written", async () => {
    const dir = mkdtempSync(join(tmpdir(), "mfk-redirect-"));
    const videosPath = join(dir, "videos.json");
    const statePath = join(dir, "state.json");
    const verdictsPath = join(dir, "terms-verdicts.json");
    writeFileSync(videosPath, JSON.stringify([{ id: "kidsVid0001" }]));
    writeFileSync(verdictsPath, JSON.stringify(verdictsWith("NOT_BARRED")));
    const lines: string[] = [];
    // What fetch does with redirect: "error" when the answer is a redirect: it rejects instead of following it.
    const fetchImpl = async (_url: string, init?: { redirect?: "error" }) => {
      if (init?.redirect === "error") throw new TypeError("fetch failed");
      return { status: 200, text: async () => JSON.stringify(fixture("true")) };
    };
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl, experiment: "kids-explainers", videosPath, statePath, verdictsPath, now: AT, log: (l) => lines.push(l) });
    expect(code).toBe(1);
    expect(existsSync(statePath)).toBe(false);
    expect(lines.join("\n")).toMatch(/fetch failed — nothing written/);
  });

  it("the committed verdicts hold no active googleapis.com entry today, so the script as committed refuses", () => {
    // Fold 5 of the ruling (the terms read at github grade) writes the entry; when it is active, this pin changes with
    // the fold that wires the run, as the no-workflow assertion above does.
    expect(TERMS_VERDICTS).toBe(resolve(ROOT, "research/channel-loop/terms-verdicts.json"));
    expect(readTermsVerdicts()).not.toBeNull();
    expect(apiTermsGate(readTermsVerdicts()).ok).toBe(false);
    const dir = mkdtempSync(join(tmpdir(), "mfk-cli-"));
    const r = spawnSync(
      process.execPath,
      ["--import", "tsx", "scripts/youtube-madeforkids-readback.ts", "--line", "kids-explainers", "--videos", join(dir, "none.json"), "--state", join(dir, "state.json")],
      { cwd: ROOT, encoding: "utf8", env: { ...process.env, [API_KEY_ENV]: KEY } },
    );
    expect(r.status, `${r.stdout}${r.stderr}`).toBe(2);
    expect(r.stdout).toMatch(/googleapis\.com/);
    expect(r.stdout).toMatch(/refusing to run/);
    expect(existsSync(join(dir, "state.json"))).toBe(false);
  });
});

describe("the state holds only the colony's own facts (ruling 12.10 row 28 §2)", () => {
  const T0 = "2027-03-01T00:00:00.000Z";
  const at = (h: number) => new Date(Date.parse(T0) + h * 3_600_000).toISOString();
  const uploads = [{ id: "t1Video001" }];
  /** Every reading the parser can give for one asked id: returned with each designation and each privacyStatus (or none), or not returned. */
  const KINDS: Omit<MadeForKidsReading, "id" | "readAt">[] = [
    ...(["true", "false", null] as const).flatMap((madeForKids) =>
      (["public", "private", "unlisted", null] as const).map((privacyStatus) => ({ returned: true, madeForKids, privacyStatus }))),
    { returned: false, madeForKids: null, privacyStatus: null },
  ];
  /** One read per colony run, at these hours: 40 h apart, so a 72 h window closes only across three runs and a 40 h one exactly at the next. */
  const RUN_HOURS = [0, 40, 80];

  /**
   * The answers of the code before ruling 12.10 row 28 (at eb2da87), computed straight from the raw reads one upload had,
   * in run order: readbackOf's `contradictedAt !== null ? contrary : first?.madeForKids ?? null` (:185), stayedPublic's
   * `first`/`latest` privacyStatus and times (:199-201) with the departure the merge recorded (:167), and
   * firstUploadWindow's P1 from `firstRead` (:244-246). §2 decision 3: the new shape must give the same answers.
   */
  function before(reads: MadeForKidsReading[], declares: boolean) {
    const declared = String(declares);
    const first = reads.find((r) => r.madeForKids !== null) ?? null;
    const latest = reads[reads.length - 1]!;
    const firstRead = reads[0]!;
    const contradicted = reads.some((r) => r.madeForKids !== null && r.madeForKids !== declared);
    const left = reads.some((r, i) => i > 0 && reads[i - 1]!.privacyStatus === "public" && r.privacyStatus !== "public");
    return {
      readback: contradicted ? (declares ? "false" : "true") : (first?.madeForKids ?? null),
      stayed: (hours: number): boolean | null => {
        if (left) return false;
        if (first?.privacyStatus !== "public" || latest.privacyStatus !== "public") return null;
        return Date.parse(latest.readAt) - Date.parse(first.readAt) >= hours * 3_600_000 ? true : null;
      },
      p1: (publisherAccepted: boolean | null): boolean | null => {
        if (publisherAccepted === false) return false;
        if (firstRead.returned === false || firstRead.privacyStatus !== "public") return false;
        return publisherAccepted === true && firstRead.privacyStatus === "public" ? true : null;
      },
    };
  }

  it("on every state the merge can reach in up to three runs, both lines: the invariant holds and every answer is the code's before the ruling", () => {
    const mismatches: string[] = [];
    let states = 0;
    const visit = (state: MadeForKidsState, reads: MadeForKidsReading[]) => {
      states++;
      const where = `${state.experiment} ${reads.map((r) => `${r.madeForKids}/${r.privacyStatus}/${r.returned}`).join(" → ")}`;
      const bad = nonColonyLeaves(state);
      if (bad.length) mismatches.push(`${where}: ${bad.join(", ")}`);
      try {
        assertColonyFactsOnly(state);
      } catch (error) {
        mismatches.push(`${where}: assertColonyFactsOnly threw ${String(error)}`);
      }
      const want = before(reads, state.declaresMadeForKids);
      const entry = state.videos[0]!;
      const got = {
        readback: readbackOf(state, uploads)[0],
        stayed72: stayedPublic(entry, 72),
        stayed40: stayedPublic(entry, 40),
        p1: [true, false, null].map((a) => firstUploadWindow(entry, a, true, true).p1),
      };
      const expected = { readback: want.readback, stayed72: want.stayed(72), stayed40: want.stayed(40), p1: [true, false, null].map(want.p1) };
      if (JSON.stringify(got) !== JSON.stringify(expected)) mismatches.push(`${where}: got ${JSON.stringify(got)}, before ${JSON.stringify(expected)}`);
      if (reads.length === RUN_HOURS.length) return;
      for (const kind of KINDS) {
        const r: MadeForKidsReading = { id: "t1Video001", ...kind, readAt: at(RUN_HOURS[reads.length]!) };
        visit(mergeReadings(state, uploads, [r], r.readAt), [...reads, r]);
      }
    };
    for (const line of ["faceless-youtube", "kids-explainers"] as const) {
      for (const kind of KINDS) {
        const r: MadeForKidsReading = { id: "t1Video001", ...kind, readAt: at(0) };
        visit(mergeReadings(emptyState(line), uploads, [r], r.readAt), [r]);
      }
    }
    expect(states).toBe(2 * (13 + 13 ** 2 + 13 ** 3));
    expect(mismatches.slice(0, 5)).toEqual([]);
  });

  it("assertColonyFactsOnly throws on a hand-made state carrying \"public\", and on every other leaf that is not a colony fact", () => {
    const good = mergeReadings(emptyState("kids-explainers"), uploads, [{ id: "t1Video001", returned: true, madeForKids: "true", privacyStatus: "public", readAt: at(0) }], at(0));
    expect(() => assertColonyFactsOnly(good)).not.toThrow();
    expect(() => assertColonyFactsOnly(emptyState("faceless-youtube"))).not.toThrow();
    const withLeaf = (key: string, value: unknown) => ({ ...good, videos: [{ ...good.videos[0]!, [key]: value }] });
    expect(() => assertColonyFactsOnly(withLeaf("privacyStatus", "public"))).toThrow(/not a colony fact at state\.videos\[0\]\.privacyStatus/);
    for (const word of API_WORDS) {
      expect(() => assertColonyFactsOnly(withLeaf("lastPublicAt", word)), word).toThrow(/not a colony fact at state\.videos\[0\]\.lastPublicAt/);
      expect(() => assertColonyFactsOnly({ ...good, videos: [{ ...good.videos[0]!, id: word }] }), word).toThrow(/state\.videos\[0\]\.id/);
    }
    // The shape before the ruling: a whole reading kept in the state.
    const reading = { id: "t1Video001", returned: true, madeForKids: "true", privacyStatus: "public", readAt: at(0) };
    expect(() => assertColonyFactsOnly(withLeaf("latest", reading))).toThrow(/state\.videos\[0\]\.latest\.madeForKids, state\.videos\[0\]\.latest\.privacyStatus/);
    // A time that is not an ISO time round-tripping through toISOString(); a number; a video id where a time belongs; another line.
    expect(() => assertColonyFactsOnly(withLeaf("lastPublicAt", "2027-03-01"))).toThrow(/lastPublicAt/);
    expect(() => assertColonyFactsOnly(withLeaf("lastPublicAt", "not a time"))).toThrow(/lastPublicAt/);
    expect(() => assertColonyFactsOnly(withLeaf("lastPublicAt", 3))).toThrow(/lastPublicAt/);
    expect(() => assertColonyFactsOnly(withLeaf("firstDesignationAt", "t1Video001"))).toThrow(/firstDesignationAt/);
    expect(() => assertColonyFactsOnly(withLeaf("id", "a b"))).toThrow(/state\.videos\[0\]\.id/);
    expect(() => assertColonyFactsOnly({ ...good, experiment: "kids-shorts" })).toThrow(/state\.experiment/);
    expect(() => assertColonyFactsOnly({ ...good, updatedAt: "unlisted" })).toThrow(/state\.updatedAt/);
    for (const notAState of [null, undefined, "public", 3, []]) expect(() => assertColonyFactsOnly(notAState), String(notAState)).toThrow(/not a colony fact/);
    // It names the path, never the value: what it says may be printed, and a value the API returned may not.
    for (const word of ["unlisted", "private"]) {
      let said = "";
      try {
        assertColonyFactsOnly(withLeaf("lastPublicAt", word));
      } catch (error) {
        said = String(error);
      }
      expect(said).toMatch(/not a colony fact/);
      expect(said).not.toContain(word);
    }
  });
});
