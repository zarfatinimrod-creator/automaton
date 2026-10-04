import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALLOWED_NARRATION_ENGINES,
  KOKORO_82M_VOICE_LICENCE,
  NARRATION_VOICE_LICENCES,
  REFUSED_NARRATION_VOICES,
  SYNTHETIC_VOICE_DISCLOSURE,
  checkPublication,
  type VideoManifest,
} from "../../revenue/publication-gate.js";

/**
 * P-1, the narration-licence gate (research/channel-loop/RULING-2026-09-30-video.md 16(c) item 7, fold step 10): a
 * narrated video publishes only with a voice from Kokoro-82M's official set, whose weights licence and training-data
 * statement are both rendered, loaded from the pinned archive and model; the Hebrew community voice he_shaul and its
 * archive voices-hebrew.bin are refused by name, whatever engine string comes with them.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");
const lineOf = (p: string, n: number) => read(p).split("\n")[n - 1];
const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");

const FROZEN = "research/rendered/kokoro-82m-model-card-2026-09-29";
const HEBREW_NC = "research/rendered/yk2-hf-kokoro-hebrew-nc.txt";
const K = KOKORO_82M_VOICE_LICENCE;
/** The files the chart-explainer's manifest names (products/chart-explainer/manifest.py, from tts.py's pins). */
const OFFICIAL_FILES = { voicesFile: K.archive.file, modelFile: K.model.file };

const SNAPSHOTS = new Set(["research/rendered/owid-co2-licence.txt"]);
const exists = (p: string) => SNAPSHOTS.has(p);

function video(narration: VideoManifest["narration"]): VideoManifest {
  return {
    id: "v1",
    author: "opus-writer",
    line: "faceless-youtube", // P-1 is a licence gate on every line; the kids line's language gate is G7-k
    title: "How fast did solar capacity grow after 2010?",
    description:
      "Every chart is computed from Our World in Data, CO2 and Greenhouse Gas Emissions dataset, licensed CC BY 4.0. " +
      SYNTHETIC_VOICE_DISCLOSURE,
    tags: [],
    thumbnailBrief: null,
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
    madeForKids: false,
    onScreenTagEveryFrame: null,
    narration,
    scheduledAt: "2026-11-10T09:00:00.000Z",
    runnerMinutes: 20,
    tokenCostIls: 8,
  };
}

/** Every failure of a narration, as "G:reason". Fields left out default to the official engine and files. */
const reasons = (n: Partial<VideoManifest["narration"]>) =>
  checkPublication(
    video({ engine: "kokoro-82m", voiceId: "af_heart", ...OFFICIAL_FILES, ...n } as VideoManifest["narration"]),
    { published: [], yppReviewPending: false, dmcaCounterNoticeFiled: false },
    "publish",
    exists,
  ).failures.map((f) => `${f.gate}:${f.reason}`);

describe("P-1: only Kokoro-82M's official voices narrate", () => {
  it.each(["af_heart", "ef_dora"])("publishes %s, the voice T1 and the parents' sample name today", (voiceId) => {
    // products/chart-explainer/analyses/t1.json voice.voice; products/parent-guides/tts.py DEFAULT_VOICE.
    expect(reasons({ voiceId })).toEqual([]);
  });

  it("refuses he_shaul by name, with the non-commercial line, not merely as unlisted", () => {
    const r = reasons({ voiceId: "he_shaul" });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/^G7:P-1/);
    expect(r[0]).toContain("refused by name");
    expect(r[0]).toContain("yk2-hf-kokoro-hebrew-nc.txt:60");
    expect(r[0]).toContain("Non-commercial Hebrew Kokoro ONNX export.");
  });

  it("refuses voices-hebrew.bin by name, as the voice archive or as a voice id", () => {
    for (const n of [
      { voicesFile: "voices-hebrew.bin" },
      { voicesFile: ".cache/models/voices-hebrew.bin" },
      { voiceId: "voices-hebrew.bin" },
    ]) {
      const r = reasons(n);
      expect(r.some((x) => x.startsWith("G7:P-1") && x.includes("refused by name") && x.includes("yk2-hf-kokoro-hebrew-nc.txt:70")), JSON.stringify(n)).toBe(true);
    }
  });

  it.each(["kokoro-82m", "Kokoro-82M", "kokoro-hebrew-nc", "kokoro", "", "voice-clone-x"])(
    "refuses he_shaul and voices-hebrew.bin by name whatever the engine string: %j",
    (engine) => {
      const voice = reasons({ engine, voiceId: "he_shaul" });
      expect(voice.some((x) => x.startsWith("G7:P-1") && x.includes('"he_shaul" is refused by name') && x.includes(`${HEBREW_NC}:60`))).toBe(true);
      const archive = reasons({ engine, voicesFile: "voices-hebrew.bin" });
      expect(archive.some((x) => x.startsWith("G7:P-1") && x.includes('"voices-hebrew.bin" is refused by name') && x.includes(`${HEBREW_NC}:70`))).toBe(true);
    },
  );

  it.each(["af_bella,af_jessica", "he_custom", "AF_HEART", ""])("refuses %j: not one of the official voice ids", (voiceId) => {
    const r = reasons({ voiceId });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/^G7:P-1/);
    expect(r[0]).toContain("not one of kokoro-82m's official voices");
  });

  it("refuses an official voice id read from any archive but the pinned one", () => {
    expect(reasons({ voicesFile: "voices-v1.0.bin" })).toEqual([]);
    expect(reasons({ voicesFile: "products/chart-explainer/.cache/models/voices-v1.0.bin" })).toEqual([]);
    const r = reasons({ voicesFile: "voices-community.bin" });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/^G7:P-1: voice archive "voices-community.bin"/);
    expect(r[0]).toContain("voices-v1.0.bin");
  });

  it("refuses an official voice spoken by any model but the pinned one — the non-commercial export ships its own", () => {
    // yk2-hf-kokoro-hebrew-nc.txt:68: "kokoro.onnx - ONNX model export."
    expect(lineOf(HEBREW_NC, 68)).toBe("kokoro.onnx - ONNX model export.");
    const r = reasons({ modelFile: "kokoro.onnx" });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/^G7:P-1: model file "kokoro.onnx"/);
    expect(r[0]).toContain("kokoro-v1.0.onnx");
  });

  it("refuses a manifest that does not say which archive and model spoke", () => {
    const bare = { engine: "kokoro-82m", voiceId: "af_heart" } as unknown as VideoManifest["narration"];
    const r = checkPublication(video(bare), { published: [], yppReviewPending: false, dmcaCounterNoticeFiled: false }, "publish", exists)
      .failures.map((f) => `${f.gate}:${f.reason}`);
    expect(r).toHaveLength(2);
    expect(r[0]).toMatch(/^G7:P-1: the manifest does not record the voice archive/);
    expect(r[1]).toMatch(/^G7:P-1: the manifest does not record the model file/);
    for (const blank of [null, ""]) expect(reasons({ voicesFile: blank as unknown as string })[0]).toMatch(/does not record the voice archive/);
  });

  it("refuses an engine with no licence record even with an official voice and the pinned files", () => {
    const r = reasons({ engine: "kokoro-hebrew-nc" });
    expect(r).toContain('G7:P-1: engine "kokoro-hebrew-nc" has no narration-licence record: no rendered weights licence and training-data statement cover its voices');
    // The engine check refuses it too; P-1 does not rely on it.
    expect(r.some((x) => x.startsWith('G7:narration engine "kokoro-hebrew-nc"'))).toBe(true);
  });
});

describe("P-1: engines and their licence records", () => {
  it("allows one engine, Kokoro-82M: adding one is a ruling, not an edit", () => {
    expect([...ALLOWED_NARRATION_ENGINES]).toEqual(["kokoro-82m"]);
  });

  it("every allowed engine has a licence record, and every record belongs to an allowed engine", () => {
    for (const engine of ALLOWED_NARRATION_ENGINES) expect(Object.hasOwn(NARRATION_VOICE_LICENCES, engine), engine).toBe(true);
    expect(Object.keys(NARRATION_VOICE_LICENCES).sort()).toEqual([...ALLOWED_NARRATION_ENGINES].sort());
    for (const [engine, rec] of Object.entries(NARRATION_VOICE_LICENCES)) {
      expect(rec.engine).toBe(engine);
      expect(rec.licenceEvidence.weightsLicence.length, engine).toBeGreaterThan(0);
      expect(rec.licenceEvidence.trainingData.length, engine).toBeGreaterThan(0);
    }
  });
});

/** The voice ids in hexgrad's voices.js: the live keys of VOICES and the commented-out ones under its TODO. */
function voiceIdsOf(src: string): { live: string[]; todo: string[] } {
  const live: string[] = [];
  const todo: string[] = [];
  for (const m of src.matchAll(/^ {2}(\/\/ )?([a-z]{2}_[a-z]+): \{$/gm)) (m[1] ? todo : live).push(m[2]!);
  return { live, todo };
}

/** The member names of a zip archive (an .npz is one), from its central directory. No zip64: the archive is ~28 MB. */
function zipEntryNames(buf: Buffer): string[] {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    expect(buf.readUInt32LE(p)).toBe(0x02014b50);
    const n = buf.readUInt16LE(p + 28);
    names.push(buf.toString("utf8", p + 46, p + 46 + n));
    p += 46 + n + buf.readUInt16LE(p + 30) + buf.readUInt16LE(p + 32);
  }
  return names;
}

describe("P-1's evidence: the frozen model card, the author's voice list and the pinned files", () => {
  const evidence = [...K.licenceEvidence.weightsLicence, ...K.licenceEvidence.trainingData, K.voiceCount, K.authorRepo];

  it("cites only the dated frozen copy of the model card, never the live capture the weekly render rewrites", () => {
    for (const e of evidence) expect(e.path).toBe(`${FROZEN}.txt`);
    // The frozen slug is not on the watch, so render-watch never rewrites it; the live slug is.
    const urls = read("research/rendered/urls.txt");
    expect(urls).toMatch(/\tkokoro-82m-model-card$/m);
    expect(urls).not.toContain("kokoro-82m-model-card-2026-09-29");
  });

  it("each cited line says what the gate quotes it as saying", () => {
    for (const e of evidence) expect(lineOf(e.path, e.line), `${e.path}:${e.line}`).toContain(e.quote);
    // Hand-read 30.9.2026: the weights licence and the training-data statement the ruling adopted (RULING 16(c) item 7).
    expect(K.licenceEvidence.weightsLicence.map((e) => e.line)).toEqual([53, 97]);
    // Ruling 4.10 §5 rule 2 (fold action 6): the card's CC BY table joins the record, :263/:267 and :271/:275.
    expect(K.licenceEvidence.trainingData.map((e) => e.line)).toEqual([235, 241, 263, 267, 271, 275]);
    expect(lineOf(`${FROZEN}.txt`, 53)).toBe("License: apache-2.0");
    expect(lineOf(`${FROZEN}.txt`, 253)).toBe("The following CC BY audio was part of the dataset used to train Kokoro v1.0.");
    // Each CC BY line is the whole line, not a substring of a longer one: a dataset name, then its licence four lines on.
    for (const [line, text] of [[263, "Koniwa tnc"], [267, "CC BY 3.0"], [271, "SIWIS"], [275, "CC BY 4.0"]] as const) {
      expect(lineOf(`${FROZEN}.txt`, line)).toBe(text);
      expect(K.licenceEvidence.trainingData.find((e) => e.line === line)?.quote).toBe(text);
    }
    expect(lineOf(`${FROZEN}.txt`, 241)).toBe("Synthetic audio [1] generated by closed [2] TTS models from large providers");
    expect(lineOf(`${FROZEN}.txt`, 99)).toBe("🐈 GitHub : https://github.com/hexgrad/kokoro");
  });

  it("is byte for byte the capture commit f9a41c6 stored, and its meta says so", () => {
    const sha = sha256(readFileSync(resolve(ROOT, `${FROZEN}.html`)));
    // The live meta's sha256 at f9a41c6 (fetched 2026-09-29T11:27:12.497Z).
    expect(sha).toBe("5b8e9927197c7e1820a55ab6aea3c9b09b571204f8f17fa964ac49c9c1db2e70");
    const meta = JSON.parse(read(`${FROZEN}.meta.json`)) as Record<string, unknown> & { frozen: Record<string, string> };
    expect(meta.slug).toBe("kokoro-82m-model-card-2026-09-29");
    expect(meta.sha256).toBe(sha);
    expect(meta.textPath).toBe(`${FROZEN}.txt`);
    expect(meta.frozen.from).toBe("research/rendered/kokoro-82m-model-card.meta.json");
    expect(meta.frozen.commit).toBe("f9a41c6");
  });

  it("the allowlist is exactly the 54 voice ids of the author's own voices.js, frozen at its commit", () => {
    const { voiceList } = K;
    const bytes = readFileSync(resolve(ROOT, voiceList.path));
    expect(sha256(bytes)).toBe(voiceList.sha256);
    const meta = JSON.parse(read(voiceList.path.replace(/\.txt$/, ".meta.json"))) as Record<string, unknown>;
    expect(meta.url).toBe(voiceList.url);
    expect(meta.sha256).toBe(voiceList.sha256);
    expect(meta.textPath).toBe(voiceList.path);
    // Pinned to a commit of the repository the card names as the model's own (:99), so the bytes cannot change.
    expect(voiceList.url).toMatch(/^https:\/\/raw\.githubusercontent\.com\/hexgrad\/kokoro\/[0-9a-f]{40}\/kokoro\.js\/src\/voices\.js$/);
    expect(read("research/rendered/urls.txt")).not.toContain("hexgrad-kokoro-voices-js");

    const src = bytes.toString("utf8");
    const { live, todo } = voiceIdsOf(src);
    expect(src.split("\n")[209]).toBe("  // TODO: Add support for other languages:"); // :210, the line above the 26
    expect([live.length, todo.length]).toEqual([28, 26]);
    expect(new Set([...live, ...todo]).size).toBe(54);
    expect([...K.voices].sort()).toEqual([...live, ...todo].sort());
  });

  it("the allowlist is as large as the card's v1.0 row says, and the refused names are outside it", () => {
    expect(lineOf(`${FROZEN}.txt`, 141)).toBe("v1.0"); // the release row the count belongs to
    const stated = Number(/& (\d+)$/.exec(lineOf(K.voiceCount.path, K.voiceCount.line))![1]);
    expect(stated).toBe(54);
    expect(K.voices.size).toBe(stated);
    for (const name of Object.keys(REFUSED_NARRATION_VOICES)) expect(K.voices.has(name), name).toBe(false);
  });

  it("names the archive and the model both Kokoro products pin: re-pinning either means re-deriving the allowlist", () => {
    expect(K.archive.file).toBe("voices-v1.0.bin");
    expect(K.model.file).toBe("kokoro-v1.0.onnx");
    for (const f of [K.archive, K.model]) {
      expect(f.pinnedIn).toEqual(["products/chart-explainer/tts.py", "products/parent-guides/tts.py"]);
      for (const p of f.pinnedIn) {
        const src = read(p);
        expect(src, `${p} ${f.file}`).toContain(`"${f.file}"`);
        expect(src, `${p} ${f.file}`).toContain(`"${f.sha256}"`);
      }
    }
  });

  // The archive is downloaded, never committed (products/chart-explainer/.gitignore). Where a render has cached it, its
  // members are re-listed and must be the allowlist, one .npy per voice.
  const cached = resolve(ROOT, "products/chart-explainer/.cache/models", K.archive.file);
  it.skipIf(!existsSync(cached))("the cached pinned archive holds exactly the allowlisted voices", () => {
    const buf = readFileSync(cached);
    expect(sha256(buf)).toBe(K.archive.sha256);
    expect(zipEntryNames(buf).sort()).toEqual([...K.voices].map((v) => `${v}.npy`).sort());
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
