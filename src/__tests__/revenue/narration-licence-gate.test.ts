import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  KOKORO_82M_VOICE_LICENCE,
  REFUSED_NARRATION_VOICES,
  SYNTHETIC_VOICE_DISCLOSURE,
  checkPublication,
  type VideoManifest,
} from "../../revenue/publication-gate.js";

/**
 * P-1, the narration-licence gate (research/channel-loop/RULING-2026-09-30-video.md 16(c) item 7, fold step 10): a
 * narrated video publishes only with a voice from Kokoro-82M's official set, whose weights licence and training-data
 * statement are both rendered; the Hebrew community voice he_shaul and its archive voices-hebrew.bin are refused by name.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");
const lineOf = (p: string, n: number) => read(p).split("\n")[n - 1];

const FROZEN = "research/rendered/kokoro-82m-model-card-2026-09-29";
const HEBREW_NC = "research/rendered/yk2-hf-kokoro-hebrew-nc.txt";

const SNAPSHOTS = new Set(["research/rendered/owid-co2-licence.txt"]);
const exists = (p: string) => SNAPSHOTS.has(p);

function video(narration: VideoManifest["narration"]): VideoManifest {
  return {
    id: "v1",
    author: "opus-writer",
    title: "How fast did solar capacity grow after 2010?",
    description:
      "Every chart is computed from Our World in Data, CO2 and Greenhouse Gas Emissions dataset, licensed CC BY 4.0. " +
      SYNTHETIC_VOICE_DISCLOSURE,
    topic: "technology adoption",
    script: "Solar capacity grew roughly tenfold between 2010 and 2020. Capacity is not generation.",
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
    narration,
    scheduledAt: "2026-11-10T09:00:00.000Z",
    runnerMinutes: 20,
    tokenCostIls: 8,
  };
}

const reasons = (n: VideoManifest["narration"]) =>
  checkPublication(video(n), { published: [], yppReviewPending: false, dmcaCounterNoticeFiled: false }, "publish", exists).failures.map(
    (f) => `${f.gate}:${f.reason}`,
  );

describe("P-1: only Kokoro-82M's official voices narrate", () => {
  it.each(["af_heart", "ef_dora"])("publishes %s, the voice T1 and the parents' sample name today", (voiceId) => {
    // products/chart-explainer/analyses/t1.json voice.voice; products/parent-guides/tts.py DEFAULT_VOICE.
    expect(reasons({ engine: "kokoro-82m", voiceId })).toEqual([]);
  });

  it("refuses he_shaul by name, with the non-commercial line, not merely as unlisted", () => {
    const r = reasons({ engine: "kokoro-82m", voiceId: "he_shaul" });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/^G7:P-1/);
    expect(r[0]).toContain("refused by name");
    expect(r[0]).toContain("yk2-hf-kokoro-hebrew-nc.txt:60");
    expect(r[0]).toContain("Non-commercial Hebrew Kokoro ONNX export.");
  });

  it("refuses voices-hebrew.bin by name, as the voice archive or as a voice id", () => {
    for (const n of [
      { engine: "kokoro-82m", voiceId: "af_heart", voicesFile: "voices-hebrew.bin" },
      { engine: "kokoro-82m", voiceId: "af_heart", voicesFile: ".cache/models/voices-hebrew.bin" },
      { engine: "kokoro-82m", voiceId: "voices-hebrew.bin" },
    ]) {
      const r = reasons(n);
      expect(r.some((x) => x.startsWith("G7:P-1") && x.includes("refused by name") && x.includes("yk2-hf-kokoro-hebrew-nc.txt:70")), JSON.stringify(n)).toBe(true);
    }
  });

  it.each(["af_bella,af_jessica", "he_custom", "AF_HEART", ""])("refuses %j: not one of the official voice ids", (voiceId) => {
    const r = reasons({ engine: "kokoro-82m", voiceId });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/^G7:P-1/);
    expect(r[0]).toContain("not one of Kokoro-82M's official voices");
  });

  it("refuses an official voice id read from any archive but the pinned one", () => {
    expect(reasons({ engine: "kokoro-82m", voiceId: "af_heart", voicesFile: "voices-v1.0.bin" })).toEqual([]);
    const r = reasons({ engine: "kokoro-82m", voiceId: "af_heart", voicesFile: "voices-community.bin" });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/^G7:P-1/);
    expect(r[0]).toContain("voices-v1.0.bin");
  });
});

describe("P-1's evidence: the frozen model card and the pinned voices archive", () => {
  it("cites only the dated frozen copy of the model card, never the live capture the weekly render rewrites", () => {
    const all = [...KOKORO_82M_VOICE_LICENCE.weightsLicence, ...KOKORO_82M_VOICE_LICENCE.trainingData, KOKORO_82M_VOICE_LICENCE.voiceCount];
    for (const e of all) expect(e.path).toBe(`${FROZEN}.txt`);
    // The frozen slug is not on the watch, so render-watch never rewrites it; the live slug is.
    const urls = read("research/rendered/urls.txt");
    expect(urls).toMatch(/\tkokoro-82m-model-card$/m);
    expect(urls).not.toContain("kokoro-82m-model-card-2026-09-29");
  });

  it("each cited line says what the gate quotes it as saying", () => {
    const all = [...KOKORO_82M_VOICE_LICENCE.weightsLicence, ...KOKORO_82M_VOICE_LICENCE.trainingData, KOKORO_82M_VOICE_LICENCE.voiceCount];
    for (const e of all) expect(lineOf(e.path, e.line), `${e.path}:${e.line}`).toContain(e.quote);
    // Hand-read 30.9.2026: the weights licence and the training-data statement the ruling adopted (RULING 16(c) item 7).
    expect(KOKORO_82M_VOICE_LICENCE.weightsLicence.map((e) => e.line)).toEqual([53, 97]);
    expect(KOKORO_82M_VOICE_LICENCE.trainingData.map((e) => e.line)).toEqual([235, 241]);
    expect(lineOf(`${FROZEN}.txt`, 53)).toBe("License: apache-2.0");
    expect(lineOf(`${FROZEN}.txt`, 241)).toBe("Synthetic audio [1] generated by closed [2] TTS models from large providers");
  });

  it("is byte for byte the capture commit f9a41c6 stored, and its meta says so", () => {
    const sha = createHash("sha256").update(readFileSync(resolve(ROOT, `${FROZEN}.html`))).digest("hex");
    // The live meta's sha256 at f9a41c6 (fetched 2026-09-29T11:27:12.497Z).
    expect(sha).toBe("5b8e9927197c7e1820a55ab6aea3c9b09b571204f8f17fa964ac49c9c1db2e70");
    const meta = JSON.parse(read(`${FROZEN}.meta.json`)) as Record<string, unknown> & { frozen: Record<string, string> };
    expect(meta.slug).toBe("kokoro-82m-model-card-2026-09-29");
    expect(meta.sha256).toBe(sha);
    expect(meta.textPath).toBe(`${FROZEN}.txt`);
    expect(meta.frozen.from).toBe("research/rendered/kokoro-82m-model-card.meta.json");
    expect(meta.frozen.commit).toBe("f9a41c6");
  });

  it("the allowlist is as large as the card's v1.0 row says, and the refused names are outside it", () => {
    const { voiceCount } = KOKORO_82M_VOICE_LICENCE;
    expect(lineOf(`${FROZEN}.txt`, 141)).toBe("v1.0"); // the release row the count belongs to
    const stated = Number(/& (\d+)$/.exec(lineOf(voiceCount.path, voiceCount.line))![1]);
    expect(stated).toBe(54);
    expect(KOKORO_82M_VOICE_LICENCE.voices.size).toBe(stated);
    for (const name of Object.keys(REFUSED_NARRATION_VOICES)) expect(KOKORO_82M_VOICE_LICENCE.voices.has(name), name).toBe(false);
  });

  it("was read from the voices archive both Kokoro products pin: re-pinning it means re-deriving the allowlist", () => {
    const { archive } = KOKORO_82M_VOICE_LICENCE;
    expect(archive.file).toBe("voices-v1.0.bin");
    for (const p of ["products/chart-explainer/tts.py", "products/parent-guides/tts.py"]) {
      const src = read(p);
      expect(src, p).toContain(`"${archive.file}"`);
      expect(src, p).toContain(`"${archive.sha256}"`);
    }
  });

  it("quotes the Hebrew community card's own lines for each refusal", () => {
    expect(lineOf(HEBREW_NC, 60)).toBe("Non-commercial Hebrew Kokoro ONNX export.");
    expect(lineOf(HEBREW_NC, 70)).toBe("voices-hebrew.bin - kokoro-onnx compatible voice archive with he_shaul .");
    expect(REFUSED_NARRATION_VOICES.he_shaul).toContain(`${HEBREW_NC}:60`);
    expect(REFUSED_NARRATION_VOICES["voices-hebrew.bin"]).toContain(`${HEBREW_NC}:70`);
    // A one-time capture, not on the watch: its line numbers cannot drift.
    expect(read("research/rendered/urls.txt")).not.toMatch(/\tyk2-hf-kokoro-hebrew-nc$/m);
  });
});
