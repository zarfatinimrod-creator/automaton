import { describe, it, expect } from "vitest";
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MAX_IDS_PER_CALL,
  READ_HOST,
  VIDEOS_LIST_URL,
  emptyState,
  mergeReadings,
  parseVideosList,
  readbackOf,
  stayedPublic,
  videosListUrl,
  type MadeForKidsReading,
  type MadeForKidsState,
  type UploadReadback,
} from "../../revenue/youtube-madeforkids.js";
import { FACELESS_YOUTUBE_EXPERIMENT, KIDS_EXPLAINERS_EXPERIMENT, evaluateExperiment, type ExperimentReadings } from "../../revenue/experiments.js";
import { API_KEY_ENV, defaultPaths, runReadback } from "../../../scripts/youtube-madeforkids-readback.js";
// @ts-expect-error — plain ESM script, no type declarations by design
import { termsBarred } from "../../../scripts/render-watch.mjs";

/**
 * The made-for-kids read-back (research/channel-loop/RULING-2026-10-04-kids-youtube.md §6 rule 2, §10; fold action 7):
 * `videos.list`, `part=status`, with an API key from the environment, writing each uploaded video's madeForKids and
 * privacyStatus into the experiment's state. Every upload is re-read on every run (an override YouTube sets after the
 * first read must be seen: P-2 counts overrides "when YouTube sets them"), keeping the first designation read, the latest
 * read, and the first read that contradicted the line's declaration. Every test here is offline: the fetch is a fake that
 * answers from fixtures. No workflow runs the script, and none may (asserted below): it is first run live after Stage A.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const fixture = (name: string) => JSON.parse(readFileSync(resolve(ROOT, `src/__tests__/revenue/fixtures/youtube-videos-list-mfk-${name}.json`), "utf8"));
const AT = "2027-03-11T06:00:00.000Z";
const KEY = "test-key-not-a-real-one";

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
      { id: "kidsVid0001", madeForKids: "true", privacyStatus: "public", readAt: AT },
    ]);
  });

  it("reads false", () => {
    expect(parseVideosList(fixture("false"), ["kidsVid0002"], AT)).toEqual([
      { id: "kidsVid0002", madeForKids: "false", privacyStatus: "public", readAt: AT },
    ]);
  });

  it("reads a video not returned, and one whose status has no madeForKids, as null — never as false", () => {
    // readAt is when the read was taken, whatever it carried: a read that found nothing is still a read.
    expect(parseVideosList(fixture("missing"), ["kidsVid0003", "kidsVid0004"], AT)).toEqual([
      { id: "kidsVid0003", madeForKids: null, privacyStatus: null, readAt: AT },
      { id: "kidsVid0004", madeForKids: null, privacyStatus: "private", readAt: AT },
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
  const read = (id: string, madeForKids: "true" | "false" | null, readAt: string, privacyStatus: string | null = "public"): MadeForKidsReading =>
    ({ id, madeForKids, privacyStatus, readAt });
  const entry = (id: string, o: Partial<UploadReadback> = {}): UploadReadback =>
    ({ id, first: null, latest: null, contradictedAt: null, leftPublicAt: null, ...o });

  it("starts empty, carrying the line's declared audience", () => {
    expect(emptyState("kids-explainers")).toEqual({ experiment: "kids-explainers", declaresMadeForKids: true, updatedAt: null, videos: [] });
    expect(emptyState("faceless-youtube").declaresMadeForKids).toBe(false);
  });

  it("keeps the first designation read, replaces the latest, and records the times", () => {
    const uploads = [{ id: "v1" }, { id: "v2" }];
    const one = mergeReadings(emptyState("kids-explainers"), uploads, [read("v1", "true", T0), read("v2", null, T0, null)], T0);
    expect(one.videos).toEqual([
      entry("v1", { first: read("v1", "true", T0), latest: read("v1", "true", T0) }),
      entry("v2", { latest: read("v2", null, T0, null) }),
    ]);
    const two = mergeReadings(one, uploads, [read("v1", "true", T1R), read("v2", "true", T1R)], T1R);
    expect(two.videos[0]).toEqual(entry("v1", { first: read("v1", "true", T0), latest: read("v1", "true", T1R) }));
    expect(two.videos[1]).toEqual(entry("v2", { first: read("v2", "true", T1R), latest: read("v2", "true", T1R) }));
    expect(two.updatedAt).toBe(T1R);
    expect(readbackOf(two, uploads)).toEqual(["true", "true"]);
  });

  it("T1's line: an override YouTube sets after the first read is seen at the next read and counted", () => {
    const uploads = [{ id: "v1" }];
    const first = mergeReadings(emptyState("faceless-youtube"), uploads, [read("v1", "false", T0)], T0);
    expect(readbackOf(first, uploads)).toEqual(["false"]);
    const later = mergeReadings(first, uploads, [read("v1", "true", T1R)], T1R);
    expect(later.videos[0]!.contradictedAt).toBe(T1R);
    expect(later.videos[0]!.first!.madeForKids).toBe("false"); // the read-back after the upload is kept as it was
    expect(readbackOf(later, uploads)).toEqual(["true"]);
  });

  it("T1's line: an override stays counted after the one appeal sets it back (P-2: \"whatever the one appeal later decides\")", () => {
    const uploads = [{ id: "v1" }];
    const overridden = mergeReadings(emptyState("faceless-youtube"), uploads, [read("v1", "true", T0)], T0);
    const appealed = mergeReadings(overridden, uploads, [read("v1", "false", T1R)], T1R);
    expect(appealed.videos[0]!.latest!.madeForKids).toBe("false");
    expect(appealed.videos[0]!.contradictedAt).toBe(T0);
    expect(readbackOf(appealed, uploads)).toEqual(["true"]);
  });

  it("the kids line: an earlier false is never overwritten by a fresh true (the K-mfk-designation kill stands)", () => {
    const uploads = [{ id: "v1" }];
    const lost = mergeReadings(emptyState("kids-explainers"), uploads, [read("v1", "false", T0)], T0);
    const back = mergeReadings(lost, uploads, [read("v1", "true", T1R)], T1R);
    expect(back.videos[0]!.first).toEqual(read("v1", "false", T0));
    expect(back.videos[0]!.latest).toEqual(read("v1", "true", T1R));
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
    expect(gone.videos[0]!.latest).toEqual(read("v1", null, T1R, null));
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
    expect(merged.videos[1]!.latest!.readAt).toBe(T0); // not asked this run: left as it was
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

describe("the script (scripts/youtube-madeforkids-readback.ts), offline", () => {
  function setup(uploads: { id: string }[] | null, prior: MadeForKidsState | null = null) {
    const dir = mkdtempSync(join(tmpdir(), "mfk-"));
    const videosPath = join(dir, "videos.json");
    const statePath = join(dir, "state.json");
    if (uploads) writeFileSync(videosPath, JSON.stringify(uploads));
    if (prior) writeFileSync(statePath, JSON.stringify(prior));
    const lines: string[] = [];
    const calls: string[] = [];
    const answers: Record<string, unknown> = {};
    const fetchImpl = async (url: string) => {
      calls.push(url);
      const ids = new URL(url).searchParams.get("id") ?? "";
      const body = answers[ids];
      if (body === undefined) return { status: 500, text: async () => "unexpected request" };
      return { status: (body as { error?: { code: number } }).error?.code ?? 200, text: async () => JSON.stringify(body) };
    };
    return { dir, videosPath, statePath, lines, calls, answers, fetchImpl, log: (s: string) => lines.push(s) };
  }

  it("refuses to run without YOUTUBE_DATA_API_KEY: no request, no file", async () => {
    expect(API_KEY_ENV).toBe("YOUTUBE_DATA_API_KEY");
    const s = setup([{ id: "kidsVid0001" }]);
    for (const env of [{}, { [API_KEY_ENV]: "" }, { [API_KEY_ENV]: "   " }]) {
      const code = await runReadback({ env, fetchImpl: s.fetchImpl, experiment: "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, now: AT, log: s.log });
      expect(code).toBe(2);
    }
    expect(s.calls).toEqual([]);
    expect(existsSync(s.statePath)).toBe(false);
    expect(s.lines.join("\n")).toMatch(/YOUTUBE_DATA_API_KEY is not set/);
  });

  it("reads every upload, writes their readings, and never prints the key", async () => {
    const s = setup([{ id: "kidsVid0001" }, { id: "kidsVid0003" }, { id: "kidsVid0004" }]);
    s.answers["kidsVid0001,kidsVid0003,kidsVid0004"] = {
      items: [fixture("true").items[0], fixture("missing").items[0]],
    };
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, now: AT, log: s.log });
    expect(code).toBe(0);
    expect(s.calls).toHaveLength(1);
    expect(new URL(s.calls[0]!).hostname).toBe("www.googleapis.com");
    const state = JSON.parse(readFileSync(s.statePath, "utf8")) as MadeForKidsState;
    expect(state.experiment).toBe("kids-explainers");
    expect(readbackOf(state, [{ id: "kidsVid0001" }, { id: "kidsVid0003" }, { id: "kidsVid0004" }])).toEqual(["true", null, null]);
    expect(state.videos.map((v) => v.latest?.privacyStatus)).toEqual(["public", null, "private"]);
    expect(state.videos.map((v) => v.latest?.readAt)).toEqual([AT, AT, AT]);
    expect(s.lines.join("\n")).not.toContain(KEY);
    expect(readFileSync(s.statePath, "utf8")).not.toContain(KEY);
  });

  it("re-reads an upload that already has a reading, keeping the first and recording the latest", async () => {
    // T1's line, read false on 1.3; on 11.3 YouTube has set it to made for kids. A reader that asked only about unread
    // uploads would never see it (the 4.10 review): P-2 counts overrides "when YouTube sets them".
    const EARLIER = "2027-03-01T06:00:00.000Z";
    const firstRead = { id: "kidsVid0001", madeForKids: "false" as const, privacyStatus: "public", readAt: EARLIER };
    const prior: MadeForKidsState = {
      ...emptyState("faceless-youtube"),
      updatedAt: EARLIER,
      videos: [{ id: "kidsVid0001", first: firstRead, latest: firstRead, contradictedAt: null, leftPublicAt: null }],
    };
    const s = setup([{ id: "kidsVid0001" }], prior);
    s.answers.kidsVid0001 = fixture("true");
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "faceless-youtube", videosPath: s.videosPath, statePath: s.statePath, now: AT, log: s.log });
    expect(code).toBe(0);
    expect(s.calls).toHaveLength(1);
    const state = JSON.parse(readFileSync(s.statePath, "utf8")) as MadeForKidsState;
    expect(state.videos[0]!.first).toEqual(firstRead);
    expect(state.videos[0]!.latest).toEqual({ id: "kidsVid0001", madeForKids: "true", privacyStatus: "public", readAt: AT });
    expect(state.videos[0]!.contradictedAt).toBe(AT);
    expect(readbackOf(state, [{ id: "kidsVid0001" }])).toEqual(["true"]);
  });

  it("asks nothing when the uploads list is empty", async () => {
    const s = setup([]);
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, now: AT, log: s.log });
    expect(code).toBe(0);
    expect(s.calls).toEqual([]);
  });

  it("asks nothing when nothing has been uploaded", async () => {
    const s = setup(null);
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, now: AT, log: s.log });
    expect(code).toBe(0);
    expect(s.calls).toEqual([]);
    expect(existsSync(s.statePath)).toBe(false);
  });

  it("batches at most 50 ids a call", async () => {
    const uploads = Array.from({ length: 51 }, (_, i) => ({ id: `kidsVid${String(i).padStart(4, "0")}` }));
    const s = setup(uploads);
    s.answers[uploads.slice(0, 50).map((u) => u.id).join(",")] = { items: [] };
    s.answers[uploads[50]!.id] = { items: [] };
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, now: AT, log: s.log });
    expect(code).toBe(0);
    expect(s.calls).toHaveLength(2);
  });

  it("fails on an API error without writing, and redacts the key from what it prints", async () => {
    const s = setup([{ id: "kidsVid0001" }]);
    s.answers.kidsVid0001 = { error: { code: 403, message: `API key ${KEY} not valid` } };
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, now: AT, log: s.log });
    expect(code).toBe(1);
    expect(existsSync(s.statePath)).toBe(false);
    expect(s.lines.join("\n")).toMatch(/HTTP 403/);
    expect(s.lines.join("\n")).not.toContain(KEY);
  });

  it("refuses a line it does not know", async () => {
    const s = setup([{ id: "kidsVid0001" }]);
    const code = await runReadback({ env: { [API_KEY_ENV]: KEY }, fetchImpl: s.fetchImpl, experiment: "kids-shorts" as "kids-explainers", videosPath: s.videosPath, statePath: s.statePath, now: AT, log: s.log });
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
});
