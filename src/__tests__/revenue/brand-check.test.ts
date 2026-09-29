import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
// @ts-expect-error — plain ESM script, no type declarations by design (same as apify-runs.mjs)
import { PROBES, checkName, lookups, outputsFor, parseCandidates, probeStatus, renderMarkdown, summarise, verdictOf } from "../../../scripts/brand-check.mjs";

/** research/measurements/brand-name-check.md: a name is offered to the owner only after a runner found it free. */
describe("brand-check", () => {
  it("reads the committed candidate list", () => {
    const names = parseCandidates(readFileSync("research/measurements/brand-candidates.txt", "utf8"));
    expect(names.length).toBeGreaterThan(5);
    expect(names).not.toContain("bediyuk");
  });

  it("refuses a name no registry takes, and a duplicate", () => {
    expect(() => parseCandidates("Good\nbad name")).toThrow(/line 2/);
    expect(() => parseCandidates("naki\nnaki")).toThrow(/twice/);
    expect(parseCandidates("# c\nNaki  # clean\n\n")).toEqual(["naki"]);
  });

  it("asks the four registries at their own lookup URLs (RULING-2026-09-29-lines.md (e) adds Netlify)", () => {
    expect(PROBES).toEqual(["com", "github", "youtube", "netlify"]);
    expect(lookups("naki")).toEqual({
      com: "https://rdap.verisign.com/com/v1/domain/naki.com",
      github: "https://api.github.com/users/naki",
      youtube: "https://www.youtube.com/@naki",
      // The bare lowercase origin netlify_files() takes (products/chart-explainer/netlify_files.py).
      netlify: "https://naki.netlify.app",
    });
  });

  it("calls a name free only on a 404 from all four; a refusal is unknown, not free", () => {
    expect([verdictOf(404), verdictOf(200), verdictOf(403), verdictOf(301), verdictOf("error: timeout")]).toEqual([
      "free",
      "taken",
      "unknown",
      "unknown",
      "unknown",
    ]);
    const row = (name: string, com: string, github: string, youtube: string, netlify: string) => ({
      name,
      com: { verdict: com },
      github: { verdict: github },
      youtube: { verdict: youtube },
      netlify: { verdict: netlify },
    });
    expect(
      summarise([
        row("a", "free", "free", "free", "free"),
        row("b", "free", "taken", "free", "free"),
        row("c", "free", "unknown", "free", "free"),
        row("d", "free", "free", "free", "taken"),
        row("e", "free", "free", "free", "unknown"),
        row("f", "free", "free", "free", "free"),
      ]),
    ).toEqual({ allFree: ["a", "f"], firstAllFree: "a", unknown: ["c", "e"] });
    // A row written before the Netlify probe existed is not free on all four: the missing probe is unknown.
    const threeProbeRow = { name: "g", com: { verdict: "free" }, github: { verdict: "free" }, youtube: { verdict: "free" } };
    expect(summarise([threeProbeRow])).toEqual({ allFree: [], firstAllFree: null, unknown: ["g"] });
  });
});

describe("brand-check probes, against a fake fetch (nothing leaves the container)", () => {
  /** A fetch that answers from a table by host, records every call, and never touches the network. */
  function fakeFetch(byUrl: Record<string, number | Error>) {
    const calls: { url: string; redirect: unknown }[] = [];
    const signals: unknown[] = [];
    const impl = async (url: string, init: { redirect?: unknown; signal?: unknown } = {}) => {
      calls.push({ url, redirect: init.redirect });
      signals.push(init.signal);
      const answer = byUrl[url];
      if (answer instanceof Error) throw answer;
      if (answer === undefined) throw new Error(`unexpected fetch ${url}`);
      let cancelled = false;
      return { status: answer, body: { cancel: async () => void (cancelled = true) }, get cancelled() { return cancelled; } };
    };
    return { impl, calls, signals };
  }

  it("reads a Netlify 404 as free, and keeps only the status", async () => {
    const { impl, calls, signals } = fakeFetch({ "https://plotnotes.netlify.app": 404 });
    expect(await probeStatus("https://plotnotes.netlify.app", impl)).toBe(404);
    // redirect: "manual" — a Netlify site that 301s to a custom domain is a site, and must not be followed to a 404.
    expect(calls).toEqual([{ url: "https://plotnotes.netlify.app", redirect: "manual" }]);
    // Every probe carries a deadline: a host that never answers must end as unknown, not hang the runner's job.
    expect(signals).toHaveLength(1);
    expect(signals[0]).toBeInstanceOf(AbortSignal);
    expect((signals[0] as AbortSignal).aborted).toBe(false);
  });

  it("reads a probe that hit its deadline as unknown, never free", async () => {
    const timedOut = new DOMException("The operation was aborted due to timeout", "TimeoutError");
    const { impl, signals } = fakeFetch({ "https://slow.netlify.app": timedOut });
    const status = await probeStatus("https://slow.netlify.app", impl);
    expect(status).toBe("error: The operation was aborted due to timeout");
    expect(verdictOf(status)).toBe("unknown");
    expect(signals[0]).toBeInstanceOf(AbortSignal);
  });

  it("reads anything but a 404 from Netlify as taken or unknown, never free", async () => {
    const { impl } = fakeFetch({
      "https://a.netlify.app": 200,
      "https://b.netlify.app": 301,
      "https://c.netlify.app": 401,
      "https://d.netlify.app": new Error("getaddrinfo ENOTFOUND"),
    });
    expect(verdictOf(await probeStatus("https://a.netlify.app", impl))).toBe("taken");
    expect(verdictOf(await probeStatus("https://b.netlify.app", impl))).toBe("unknown");
    expect(verdictOf(await probeStatus("https://c.netlify.app", impl))).toBe("unknown");
    const failed = await probeStatus("https://d.netlify.app", impl);
    expect(failed).toBe("error: getaddrinfo ENOTFOUND");
    expect(verdictOf(failed)).toBe("unknown");
  });

  it("checks one name on all four probes, in order, and records url, status and verdict for each", async () => {
    const urls = lookups("chartexplained");
    const { impl, calls } = fakeFetch({ [urls.com]: 404, [urls.github]: 404, [urls.youtube]: 404, [urls.netlify]: 200 });
    const row = await checkName("chartexplained", { fetchImpl: impl, pauseMs: 0 });
    expect(calls.map((c) => c.url)).toEqual([urls.com, urls.github, urls.youtube, urls.netlify]);
    expect(row).toEqual({
      name: "chartexplained",
      com: { url: urls.com, status: 404, verdict: "free" },
      github: { url: urls.github, status: 404, verdict: "free" },
      youtube: { url: urls.youtube, status: 404, verdict: "free" },
      netlify: { url: urls.netlify, status: 200, verdict: "taken" },
    });
    expect(summarise([row]).allFree).toEqual([]);
  });
});

describe("the T1 sub-brand list (RULING-2026-09-29-lines.md (e))", () => {
  const path = "research/measurements/t1-subbrand-candidates.txt";

  it("opens with the ruling's five names in its order, adds later rounds of five after them, and never the brand's own fallback", () => {
    const text = readFileSync(path, "utf8");
    const names = parseCandidates(text);
    expect(names.slice(0, 5)).toEqual(["chartexplained", "plotnotes", "axisnotes", "dataplotted", "linesandbars"]);
    // Ruling (e) APPLY 3: when none of a round is free on all four probes, the loop writes the next five and re-runs,
    // keeping the earlier rounds above so the list order holds.
    expect(names.length % 5).toBe(0);
    expect(new Set(names).size).toBe(names.length);
    expect(names).not.toContain("tikufi");
    expect(text).toContain("RULING-2026-09-29-lines.md (e)");
    // The account question is not decided by the name, and is not decided here.
    expect(text).toMatch(/FABLE_QUEUE row 16/);
  });

  it("derives where a list's answers go, and refuses a path outside research/measurements", () => {
    expect(outputsFor(path)).toEqual({
      candidates: "research/measurements/t1-subbrand-candidates.txt",
      json: "research/measurements/t1-subbrand-candidates.json",
      md: "research/measurements/t1-subbrand-check.md",
    });
    // The brand list keeps the JSON path its 27.9 answers were committed under.
    expect(outputsFor("research/measurements/brand-candidates.txt").json).toBe("research/measurements/brand-candidates.json");
    // The workflow passes a dispatch input through here: anything but a list in research/measurements is refused.
    for (const bad of [
      "research/measurements/../../.github/workflows/x-candidates.txt",
      "/etc/passwd",
      "research/measurements/brand-candidates.json",
      "research/other/t1-candidates.txt",
      "research/measurements/sub/t1-candidates.txt",
      "research/measurements/T1-candidates.txt",
    ]) {
      expect(() => outputsFor(bad), bad).toThrow(/candidate list/);
    }
  });

  it("writes a Markdown table that names the first all-free name in list order, and carries the Netlify reading's grade", () => {
    const r = (name: string, verdicts: string[]) => ({
      name,
      ...Object.fromEntries(PROBES.map((p: string, i: number) => [p, { url: `u-${p}`, status: verdicts[i] === "free" ? 404 : 200, verdict: verdicts[i] }])),
    });
    const rows = [
      r("chartexplained", ["taken", "free", "free", "free"]),
      r("plotnotes", ["free", "free", "free", "free"]),
      r("axisnotes", ["free", "free", "free", "free"]),
    ];
    const md = renderMarkdown({ measuredAt: "2026-09-29T12:00:00.000Z", candidates: path, ...summarise(rows), rows });
    expect(md).toContain("| name | .com | GitHub | YouTube | Netlify | all four free |");
    expect(md).toContain("| `chartexplained` | taken (200) | free (404) | free (404) | free (404) | no |");
    expect(md).toContain("| `plotnotes` | free (404) | free (404) | free (404) | free (404) | **yes** |");
    expect(md).toMatch(/First all-free name in list order: `plotnotes`/);
    expect(md).toMatch(/grade none/);
    expect(md).toContain("RULING-2026-09-29-lines.md (e)");
    // No name is chosen by the checker: the fold reads the result and records it.
    expect(md).toMatch(/not a choice/);
    const none = renderMarkdown({ measuredAt: "x", candidates: path, ...summarise([rows[0]!]), rows: [rows[0]!] });
    expect(none).toMatch(/First all-free name in list order: none/);
  });
});

describe("brand-check.yml takes the candidate list as an input", () => {
  const yml = readFileSync(".github/workflows/brand-check.yml", "utf8");

  it("declares a `candidates` dispatch input and runs on any changed *-candidates.txt", () => {
    expect(yml).toMatch(/workflow_dispatch:\s*\n\s*inputs:\s*\n\s*candidates:/);
    expect(yml).toContain('"research/measurements/*-candidates.txt"');
    expect(yml).toContain("--candidates");
  });

  it("gives the dispatch input no default, so accepting the form never re-dates the 27.9 brand list", () => {
    // Review of the (e) fold, finding 4: a default of brand-candidates.txt turned a dispatch meant for the T1 list into
    // a re-run of the brand list, overwriting its committed answers with a new date and a fourth (Netlify) column.
    const dispatch = yml.slice(yml.indexOf("workflow_dispatch:"), yml.indexOf("\n  push:"));
    expect(dispatch).toMatch(/candidates:/);
    expect(dispatch).toMatch(/required: true/);
    expect(dispatch).not.toMatch(/^\s*default:/m);
  });

  it("passes the input through the environment, never into the shell script's text", () => {
    // A dispatch input interpolated into `run:` is a script-injection route; outputsFor() validates it once it is data.
    const runBlocks = yml.split("\n").filter((l) => !/^\s*[A-Z_]+: \$\{\{/.test(l));
    expect(runBlocks.join("\n")).not.toMatch(/\$\{\{\s*(github\.event\.)?inputs\./);
  });
});
