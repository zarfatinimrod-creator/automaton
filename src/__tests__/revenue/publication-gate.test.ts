import { describe, it, expect } from "vitest";
import {
  checkPublication,
  type ChannelState,
  type VideoManifest,
} from "../../revenue/publication-gate.js";

const SNAPSHOTS = new Set(["research/rendered/owid-co2-licence.txt"]);
const exists = (p: string) => SNAPSHOTS.has(p);

function video(overrides: Partial<VideoManifest> = {}): VideoManifest {
  return {
    id: "v1",
    author: "opus-writer",
    title: "How fast did solar capacity grow after 2010?",
    description:
      "Every chart is computed from Our World in Data, CO2 and Greenhouse Gas Emissions dataset, licensed CC BY 4.0.",
    topic: "technology adoption",
    script:
      "Solar capacity grew roughly tenfold between 2010 and 2020. The data shows the steepest rise after 2015. " +
      "One caveat: capacity is not generation. What the data does not show is how much of it was used.",
    datasets: [
      {
        name: "Our World in Data, CO2 and Greenhouse Gas Emissions",
        licence: "CC-BY-4.0",
        licenceSnapshot: "research/rendered/owid-co2-licence.txt",
        upstream: [{ source: "Global Carbon Project", licence: "CC-BY-4.0" }],
      },
    ],
    originality: { auditor: "opus-auditor", verdict: "PASS" },
    factCheck: { auditor: "opus-auditor", verdict: "PASS", figuresChecked: 7 },
    promiseMatch: { auditor: "opus-auditor", verdict: "PASS" },
    containsSyntheticMedia: true,
    scheduledAt: "2026-11-10T09:00:00.000Z",
    runnerMinutes: 20,
    tokenCostIls: 8,
    ...overrides,
  };
}

function channel(overrides: Partial<ChannelState> = {}): ChannelState {
  return { published: [], yppReviewPending: false, dmcaCounterNoticeFiled: false, ...overrides };
}

const failed = (r: ReturnType<typeof checkPublication>) => r.failures.map((f) => f.gate);

describe("publication gate G1-G10 (VERDICT §12)", () => {
  it("passes a clean video", () => {
    const r = checkPublication(video(), channel(), "publish", exists);
    expect(r.failures).toEqual([]);
    expect(r.pass).toBe(true);
  });

  describe("G1 licence", () => {
    it("fails when the licence snapshot is missing — UNFETCHABLE is FAIL", () => {
      const v = video({ datasets: [{ ...video().datasets[0], licenceSnapshot: "research/rendered/nope.txt" }] });
      const r = checkPublication(v, channel(), "publish", exists);
      expect(failed(r)).toContain("G1");
      expect(r.failures[0].reason).toMatch(/UNFETCHABLE/);
    });
    it("fails a licence outside the allowed set", () => {
      const v = video({ datasets: [{ ...video().datasets[0], licence: "CC-BY-NC-4.0" }] });
      expect(failed(checkPublication(v, channel(), "publish", exists))).toContain("G1");
    });
    it("fails a derived dataset whose upstream licence is unknown (RED-TEAM §2.6: OWID energy on the EI Review)", () => {
      const v = video({
        datasets: [{ ...video().datasets[0], upstream: [{ source: "Energy Institute Statistical Review", licence: null }] }],
      });
      const r = checkPublication(v, channel(), "publish", exists);
      expect(failed(r)).toContain("G1");
      expect(r.failures.find((f) => f.gate === "G1")!.reason).toMatch(/Energy Institute/);
    });
    it("fails a video that uses no dataset at all", () => {
      expect(failed(checkPublication(video({ datasets: [] }), channel(), "publish", exists))).toContain("G1");
    });
  });

  describe("G2 no advice, no sensitive topic", () => {
    it.each([
      "You should move your savings into index funds.",
      "We recommend that viewers talk to a lawyer.",
      "Consult your doctor before changing medication.",
      "If you want to retire early, you need to invest now.",
    ])("fails second-person advice: %s", (line) => {
      const v = video({ script: video().script + " " + line });
      expect(failed(checkPublication(v, channel(), "publish", exists))).toContain("G2");
    });
    it.each(["personal finance", "health outcomes", "election polling", "tax law"])("fails a sensitive topic: %s", (topic) => {
      expect(failed(checkPublication(video({ topic }), channel(), "publish", exists))).toContain("G2");
    });
    it("does not flag third-person description of data", () => {
      const v = video({ script: "Countries that invested in grids early saw faster adoption. The data shows it." });
      expect(failed(checkPublication(v, channel(), "publish", exists))).not.toContain("G2");
    });
  });

  describe("G3 originality", () => {
    it("fails without an originality PASS", () => {
      expect(failed(checkPublication(video({ originality: null }), channel(), "publish", exists))).toContain("G3");
    });
    it("fails a script that is not materially varied from one already published", () => {
      const earlier = { id: "v0", publishedAt: "2026-11-01T09:00:00.000Z", script: video().script };
      const r = checkPublication(video({ id: "v1" }), channel({ published: [earlier] }), "publish", exists);
      expect(failed(r)).toContain("G3");
      expect(r.failures.find((f) => f.gate === "G3")!.reason).toMatch(/v0/);
    });
  });

  describe("G4 fact-check by someone else", () => {
    it("fails without a fact-check PASS", () => {
      const v = video({ factCheck: { auditor: "opus-auditor", verdict: "FAIL", figuresChecked: 7 } });
      expect(failed(checkPublication(v, channel(), "publish", exists))).toContain("G4");
    });
    it("fails when the author fact-checked its own script", () => {
      const v = video({ factCheck: { auditor: "opus-writer", verdict: "PASS", figuresChecked: 7 } });
      expect(failed(checkPublication(v, channel(), "publish", exists))).toContain("G4");
    });
    it("fails a fact-check that checked no figure", () => {
      const v = video({ factCheck: { auditor: "opus-auditor", verdict: "PASS", figuresChecked: 0 } });
      expect(failed(checkPublication(v, channel(), "publish", exists))).toContain("G4");
    });
  });

  it("G5 fails without a promise-match PASS", () => {
    expect(failed(checkPublication(video({ promiseMatch: null }), channel(), "publish", exists))).toContain("G5");
  });

  it("G6 fails a third video inside any 7 days", () => {
    const published = [
      { id: "a", publishedAt: "2026-11-05T09:00:00.000Z", script: "Wheat yields in Africa since 1961 are a separate question entirely." },
      { id: "b", publishedAt: "2026-11-08T09:00:00.000Z", script: "Urban population share by continent, measured every decade since 1950." },
    ];
    expect(failed(checkPublication(video(), channel({ published }), "publish", exists))).toContain("G6");
    expect(failed(checkPublication(video({ scheduledAt: "2026-11-13T09:00:00.000Z" }), channel({ published }), "publish", exists))).not.toContain("G6");
  });

  describe("G7 disclosure and attribution", () => {
    it("fails when the synthetic-media flag was never decided", () => {
      expect(failed(checkPublication(video({ containsSyntheticMedia: null }), channel(), "publish", exists))).toContain("G7");
    });
    it("fails when the description does not attribute the source and licence", () => {
      expect(failed(checkPublication(video({ description: "A video about solar." }), channel(), "publish", exists))).toContain("G7");
    });
  });

  it("G8 blocks everything once a DMCA counter-notice exists", () => {
    expect(failed(checkPublication(video(), channel({ dmcaCounterNoticeFiled: true }), "publish", exists))).toContain("G8");
  });

  it("G9 fails over the per-video compute or token caps", () => {
    expect(failed(checkPublication(video({ runnerMinutes: 61 }), channel(), "publish", exists))).toContain("G9");
    expect(failed(checkPublication(video({ tokenCostIls: 21 }), channel(), "publish", exists))).toContain("G9");
  });

  it("G10 blocks privating or deleting while a YPP review is pending, and allows publishing", () => {
    const pending = channel({ yppReviewPending: true });
    expect(failed(checkPublication(video(), pending, "privatize", exists))).toContain("G10");
    expect(failed(checkPublication(video(), pending, "delete", exists))).toContain("G10");
    expect(failed(checkPublication(video(), pending, "publish", exists))).not.toContain("G10");
  });

  it("reports every failure, not only the first", () => {
    const r = checkPublication(video({ originality: null, promiseMatch: null, runnerMinutes: 99 }), channel(), "publish", exists);
    expect(failed(r)).toEqual(expect.arrayContaining(["G3", "G5", "G9"]));
    expect(r.pass).toBe(false);
  });
});
