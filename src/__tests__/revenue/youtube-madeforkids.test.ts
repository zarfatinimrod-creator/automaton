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
  idsToRead,
  mergeReadings,
  parseVideosList,
  readbackOf,
  videosListUrl,
  type MadeForKidsState,
} from "../../revenue/youtube-madeforkids.js";
import { KIDS_EXPLAINERS_EXPERIMENT, evaluateExperiment } from "../../revenue/experiments.js";
import { API_KEY_ENV, defaultPaths, runReadback } from "../../../scripts/youtube-madeforkids-readback.js";
// @ts-expect-error — plain ESM script, no type declarations by design
import { termsBarred } from "../../../scripts/render-watch.mjs";

/**
 * The made-for-kids read-back (research/channel-loop/RULING-2026-10-04-kids-youtube.md §6 rule 2, §10; fold action 7):
 * `videos.list`, `part=status`, with an API key from the environment, writing each uploaded video's madeForKids and
 * privacyStatus into the experiment's state. Every test here is offline: the fetch is a fake that answers from fixtures.
 * No workflow runs the script, and none may (asserted below): it is first run live after Stage A.
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
    expect(parseVideosList(fixture("missing"), ["kidsVid0003", "kidsVid0004"], AT)).toEqual([
      { id: "kidsVid0003", madeForKids: null, privacyStatus: null, readAt: null },
      { id: "kidsVid0004", madeForKids: null, privacyStatus: "private", readAt: null },
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

describe("the experiment state: one reading per upload, read once", () => {
  const uploads = [{ id: "v1" }, { id: "v2" }, { id: "v3" }];
  const state = (): MadeForKidsState => ({
    ...emptyState("kids-explainers"),
    videos: [
      { id: "v1", madeForKids: "true", privacyStatus: "public", readAt: "2027-03-01T00:00:00.000Z" },
      { id: "v2", madeForKids: null, privacyStatus: null, readAt: null },
    ],
  });

  it("starts empty, carrying the line's declared audience", () => {
    expect(emptyState("kids-explainers")).toEqual({ experiment: "kids-explainers", declaresMadeForKids: true, updatedAt: null, videos: [] });
    expect(emptyState("faceless-youtube").declaresMadeForKids).toBe(false);
  });

  it("reads only what has no reading yet: unread entries and new uploads", () => {
    expect(idsToRead(state(), uploads)).toEqual(["v2", "v3"]);
    expect(idsToRead(emptyState("kids-explainers"), uploads)).toEqual(["v1", "v2", "v3"]);
  });

  it("merges in upload order, fills what was null, and never overwrites a reading already taken", () => {
    const fresh = [
      { id: "v1", madeForKids: "false" as const, privacyStatus: "public", readAt: AT }, // ignored: v1 was read
      { id: "v2", madeForKids: "true" as const, privacyStatus: "public", readAt: AT },
      { id: "v3", madeForKids: null, privacyStatus: null, readAt: null },
    ];
    const merged = mergeReadings(state(), uploads, fresh, AT);
    expect(merged.videos.map((v) => [v.id, v.madeForKids])).toEqual([
      ["v1", "true"],
      ["v2", "true"],
      ["v3", null],
    ]);
    expect(merged.videos[0]!.readAt).toBe("2027-03-01T00:00:00.000Z");
    expect(merged.updatedAt).toBe(AT);
    expect(readbackOf(merged)).toEqual(["true", "true", null]);
  });

  it("keeps a reading whose upload has left the uploads list, after the listed ones", () => {
    const merged = mergeReadings(state(), [{ id: "v2" }], [], AT);
    expect(merged.videos.map((v) => v.id)).toEqual(["v2", "v1"]);
  });

  it("feeds the experiment: a false read-back on the kids line is K-mfk-designation, an unread one freezes uploads", () => {
    const base = {
      day: 20, t1Passed: true, videosPassedGate: 3, medianStrangerViews: null, strangerWatchHours28d: null,
      averageViewPercentage: null, policySignal: false, ungrantedRecurringCost: false, madeForKidsOverrides: null,
      maxRunnerMinutesPerVideo: 20, maxTokenCostIlsPerVideo: 0,
    };
    const falseRead = mergeReadings(emptyState("kids-explainers"), [{ id: "kidsVid0002" }], parseVideosList(fixture("false"), ["kidsVid0002"], AT), AT);
    expect(evaluateExperiment(KIDS_EXPLAINERS_EXPERIMENT, { ...base, madeForKidsReadback: readbackOf(falseRead) }).triggered).toContain("K-mfk-designation");
    const unread = mergeReadings(emptyState("kids-explainers"), [{ id: "kidsVid0003" }], parseVideosList(fixture("missing"), ["kidsVid0003"], AT), AT);
    const v = evaluateExperiment(KIDS_EXPLAINERS_EXPERIMENT, { ...base, madeForKidsReadback: readbackOf(unread) });
    expect(v.triggered).toEqual(["K-mfk-unmeasured"]);
    expect(v.uploadsFrozen).toBe(true);
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

  it("reads the uploads not yet read, writes their readings, and never prints the key", async () => {
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
    expect(readbackOf(state)).toEqual(["true", null, null]);
    expect(state.videos.map((v) => v.privacyStatus)).toEqual(["public", null, "private"]);
    expect(s.lines.join("\n")).not.toContain(KEY);
    expect(readFileSync(s.statePath, "utf8")).not.toContain(KEY);
  });

  it("asks nothing when every upload already has a reading", async () => {
    const prior = { ...emptyState("kids-explainers"), videos: [{ id: "kidsVid0001", madeForKids: "true" as const, privacyStatus: "public", readAt: AT }] };
    const s = setup([{ id: "kidsVid0001" }], prior);
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
