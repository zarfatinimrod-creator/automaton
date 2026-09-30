import { describe, it, expect } from "vitest";
import {
  CC_BY_3_0_IGO_URI,
  SYNTHETIC_VOICE_DISCLOSURE,
  checkPublication,
  igoNoEndorsementSentence,
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
      "Every chart is computed from Our World in Data, CO2 and Greenhouse Gas Emissions dataset, licensed CC BY 4.0. " +
      SYNTHETIC_VOICE_DISCLOSURE,
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
    narration: { engine: "kokoro-82m", voiceId: "af_heart", voicesFile: "voices-v1.0.bin", modelFile: "kokoro-v1.0.onnx" },
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
    it.each(["Unlicense", "ODC-PDDL-1.0"])("passes a public-domain dedication recorded under its own name: %s (DATASETS.md B2)", (licence) => {
      const v = video({ datasets: [{ ...video().datasets[0], licence, upstream: [] }] });
      expect(failed(checkPublication(v, channel(), "publish", exists))).not.toContain("G1");
    });
    it.each(["MIT", "CC-BY-SA-3.0-IGO", "CC-BY-SA-4.0", "CC-BY-NC-SA-3.0-IGO"])("still fails %s", (licence) => {
      const v = video({ datasets: [{ ...video().datasets[0], licence }] });
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

  describe("G1/G7 IGO conditions (LICENCE-IGO-DECISION.md C1-C5)", () => {
    const UN = "United Nations";
    const citation =
      "United Nations, Department of Economic and Social Affairs, Population Division (2024). World Population Prospects 2024, Online Edition.";
    const snapshots = new Set([...SNAPSHOTS, "research/rendered/un-wpp-downloads.txt"]);
    const existsIgo = (p: string) => snapshots.has(p);
    const igo = (): VideoManifest =>
      video({
        title: "Which countries will have the oldest populations by 2050?",
        topic: "population ageing",
        description: `Every figure is computed from ${citation} Licensed CC BY 3.0 IGO, ${CC_BY_3_0_IGO_URI} ${igoNoEndorsementSentence(UN)} ${SYNTHETIC_VOICE_DISCLOSURE}`,
        datasets: [{ name: citation, licence: "CC-BY-3.0-IGO", licenceSnapshot: "research/rendered/un-wpp-downloads.txt", upstream: [], licensor: UN }],
      });
    const run = (v: VideoManifest, c = channel()) => checkPublication(v, c, "publish", existsIgo).failures.map((f) => `${f.gate}:${f.reason}`);

    it("passes a compliant UN WPP manifest", () => expect(run(igo())).toEqual([]));
    it("C1 rejects a snapshot that is not a render-watch capture", () => {
      const v = igo();
      v.datasets[0].licenceSnapshot = "research/snapshots/owid-co2-licence.txt";
      snapshots.add(v.datasets[0].licenceSnapshot);
      expect(run(v).some((r) => r.startsWith("G1:") && /rendered/.test(r))).toBe(true);
    });
    it("C1 needs the licensor named", () => {
      const v = igo();
      delete v.datasets[0].licensor;
      expect(run(v).some((r) => r.startsWith("G1:") && /licensor/.test(r))).toBe(true);
    });
    it("C2 requires the licence URI and a changes-made statement", () => {
      expect(run(video({ ...igo(), description: igo().description.replace(CC_BY_3_0_IGO_URI, "") })).some((r) => /URI/.test(r))).toBe(true);
      expect(run(video({ ...igo(), description: igo().description.replace("computed from", "about") })).some((r) => /§3\(b\)/.test(r))).toBe(true);
    });
    it("C3 requires the no-endorsement sentence", () => {
      expect(run(video({ ...igo(), description: igo().description.replace(igoNoEndorsementSentence(UN), "") })).some((r) => /lacks the sentence/.test(r))).toBe(true);
    });
    it.each(["UN data: the oldest countries by 2050", "What the United Nations expects by 2050", "UNESCO's literacy numbers"])(
      "C4 keeps the licensor out of the title: %s",
      (title) => {
        expect(run(video({ ...igo(), title })).some((r) => /title names the licensor/.test(r))).toBe(true);
      },
    );
    it("C4 does not fire on un- words", () => expect(run(video({ ...igo(), title: "Unemployment and unit costs: an unusual decade" }))).toEqual([]));
    it("C5 blocks publishing while a notice from the licensor is open, and only that licensor", () => {
      expect(run(igo(), channel({ openLicensorNotices: [UN] })).some((r) => /notice from United Nations is open/.test(r))).toBe(true);
      expect(run(igo(), channel({ openLicensorNotices: ["UNESCO"] }))).toEqual([]);
    });
    it("leaves a non-IGO manifest untouched by the IGO conditions", () => {
      expect(checkPublication(video(), channel(), "publish", exists).failures).toEqual([]);
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
    // Found by the dataset research (DATASETS.md, 27.9): the first version matched word prefixes.
    it.each(["taxonomy of airport runways", "lawn and park area", "global warming measurements", "livestock numbers", "diseased-free seed stock photos"])(
      "does not flag a topic that only shares a prefix with a sensitive word: %s",
      (topic) => {
        const r = checkPublication(video({ topic }), channel(), "publish", exists);
        expect(r.failures.filter((f) => f.gate === "G2" && /topic/.test(f.reason))).toEqual([]);
      },
    );
    it.each(["taxes by country", "voters per district", "drug prices", "bird migration", "stock market returns", "tech stocks"])("still flags the whole word: %s", (topic) => {
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
    it("fails when the flag is false: the board ruled true for chart + synthetic-narration videos", () => {
      expect(failed(checkPublication(video({ containsSyntheticMedia: false }), channel(), "publish", exists))).toContain("G7");
    });
    it("fails when the description lacks the synthetic-voice sentence", () => {
      const noVoice = "Every chart is computed from Our World in Data, CO2 and Greenhouse Gas Emissions dataset, licensed CC BY 4.0.";
      expect(failed(checkPublication(video({ description: noVoice }), channel(), "publish", exists))).toContain("G7");
    });
    it("fails on any narration engine but Kokoro: a voice that imitates a real person is never made", () => {
      expect(failed(checkPublication(video({ narration: { engine: "voice-clone-x", voiceId: "someone", voicesFile: "voices-v1.0.bin", modelFile: "kokoro-v1.0.onnx" } }), channel(), "publish", exists))).toContain("G7");
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
