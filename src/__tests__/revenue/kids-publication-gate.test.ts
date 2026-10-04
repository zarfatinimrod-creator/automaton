import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  KIDS_AUDIENCE_SENTENCE,
  KIDS_ON_SCREEN_TAG,
  KIDS_SPOKEN_DECLARATION,
  KIDS_VOICES,
  KOKORO_82M_VOICE_LICENCE,
  SYNTHETIC_VOICE_DISCLOSURE,
  checkPublication,
  type ChannelState,
  type VideoManifest,
} from "../../revenue/publication-gate.js";

/**
 * G11 and G7-k (research/channel-loop/RULING-2026-10-04-kids-youtube.md §4, §5 rule 1, §6 rule 1, §2 rule 2; fold action
 * 6). G11: every manifest says which line it is for and decides madeForKids — the kids line `true`, T1 `false`, `null`
 * never. G7-k, kids line only: the declaration reaches the child twice (spoken first, a tag in every frame) and the parent
 * where a parent reads (the description's opening), the voice is one of the 28 English live keys, and the metadata and
 * thumbnail brief carry none of the pre-reader, song, story, character or toy framings §2 rule 2 excludes.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SNAPSHOTS = new Set(["research/rendered/owid-co2-licence.txt"]);
const exists = (p: string) => SNAPSHOTS.has(p);
const DATASET = "Our World in Data, CO2 and Greenhouse Gas Emissions";

function kids(overrides: Partial<VideoManifest> = {}): VideoManifest {
  return {
    id: "k1",
    author: "opus-writer",
    line: "kids-explainers",
    title: "Which countries get the most sunshine?",
    description: [
      KIDS_AUDIENCE_SENTENCE,
      SYNTHETIC_VOICE_DISCLOSURE,
      `Data: ${DATASET}, licensed CC BY 4.0. Every chart is computed from that file.`,
    ].join("\n\n"),
    tags: ["sunshine", "solar power", "charts"],
    thumbnailBrief: "The bar chart from the video, drawn by code, with its title.",
    topic: "solar power by country",
    script: `${KIDS_SPOKEN_DECLARATION} Some countries make much more power from the sun than others. The chart shows which.`,
    datasets: [
      {
        name: DATASET,
        licence: "CC-BY-4.0",
        licenceSnapshot: "research/rendered/owid-co2-licence.txt",
        upstream: [{ source: "Global Carbon Project", licence: "CC-BY-4.0" }],
      },
    ],
    originality: { auditor: "opus-auditor", verdict: "PASS" },
    factCheck: { auditor: "opus-auditor", verdict: "PASS", figuresChecked: 5 },
    promiseMatch: { auditor: "opus-auditor", verdict: "PASS" },
    containsSyntheticMedia: true,
    madeForKids: true,
    onScreenTagEveryFrame: KIDS_ON_SCREEN_TAG,
    narration: { engine: "kokoro-82m", voiceId: "af_heart", voicesFile: "voices-v1.0.bin", modelFile: "kokoro-v1.0.onnx" },
    scheduledAt: "2027-03-10T09:00:00.000Z",
    runnerMinutes: 20,
    tokenCostIls: 0,
    ...overrides,
  };
}

/** T1's shape: the faceless-youtube line, not made for kids, no tag, no spoken declaration. */
function t1(overrides: Partial<VideoManifest> = {}): VideoManifest {
  return kids({
    id: "t1",
    line: "faceless-youtube",
    title: "How fast did solar capacity grow after 2010?",
    description: `Every chart is computed from ${DATASET} dataset, licensed CC BY 4.0. ${SYNTHETIC_VOICE_DISCLOSURE}`,
    tags: [],
    thumbnailBrief: null,
    script: "Solar capacity grew roughly tenfold between 2010 and 2020. Capacity is not generation.",
    madeForKids: false,
    onScreenTagEveryFrame: null,
    ...overrides,
  });
}

const channel = (): ChannelState => ({ published: [], yppReviewPending: false, dmcaCounterNoticeFiled: false });
const run = (v: VideoManifest) => checkPublication(v, channel(), "publish", exists).failures.map((f) => `${f.gate}:${f.reason}`);
const kidsFailures = (v: VideoManifest) => run(v).filter((r) => r.startsWith("G7:G7-k"));

describe("the pinned texts (ruling 4.10 §4 rules 1-2)", () => {
  it("are the ruling's sentences, verbatim", () => {
    expect(KIDS_SPOKEN_DECLARATION).toBe(
      "This video was made by a computer program, not by a person. The voice is a computer voice, not a real person. Every number comes from real data, listed under the video.",
    );
    expect(KIDS_ON_SCREEN_TAG).toBe("Made by a computer program · computer voice · not a person");
    expect(KIDS_AUDIENCE_SENTENCE).toBe("Made for children who can read. This channel is set as made for kids.");
  });

  it("match the ruling file's own text", () => {
    const ruling = readFileSync(resolve(ROOT, "research/channel-loop/RULING-2026-10-04-kids-youtube.md"), "utf8").replace(/\n\s+/g, " ");
    for (const t of [KIDS_SPOKEN_DECLARATION, KIDS_ON_SCREEN_TAG, KIDS_AUDIENCE_SENTENCE]) expect(ruling).toContain(`"${t}"`);
  });
});

describe("a clean manifest on each line", () => {
  it("passes on the kids line", () => expect(run(kids())).toEqual([]));
  it("passes on T1's line, which G7-k does not touch", () => expect(run(t1())).toEqual([]));
  it("T1 keeps every official voice P-1 allows, the non-English ones included", () => {
    expect(run(t1({ narration: { ...t1().narration, voiceId: "ef_dora" } }))).toEqual([]);
  });
});

describe("G11: the designation (ruling 4.10 §6 rule 1)", () => {
  it.each([
    ["kids-explainers", false],
    ["kids-explainers", null],
    ["faceless-youtube", true],
    ["faceless-youtube", null],
  ] as const)("fails line %s with madeForKids %s", (line, madeForKids) => {
    const v = line === "kids-explainers" ? kids({ madeForKids }) : t1({ madeForKids });
    const r = run(v);
    expect(r.filter((x) => x.startsWith("G11:"))).toHaveLength(1);
  });

  it("says why: never decided, or the line's own declaration", () => {
    expect(run(kids({ madeForKids: null })).find((r) => r.startsWith("G11:"))).toMatch(/never decided/);
    expect(run(kids({ madeForKids: false })).find((r) => r.startsWith("G11:"))).toMatch(/kids-explainers line declares true/);
    expect(run(t1({ madeForKids: true })).find((r) => r.startsWith("G11:"))).toMatch(/faceless-youtube line declares false/);
  });

  it("fails a line the gate does not know, whatever madeForKids says", () => {
    for (const madeForKids of [true, false, null]) {
      const v = kids({ line: "kids-shorts" as VideoManifest["line"], madeForKids });
      expect(run(v).some((r) => r.startsWith("G11:") && /not a YouTube line this gate knows/.test(r))).toBe(true);
    }
  });

  it("is a publish gate: privatize and delete are G10's", () => {
    expect(checkPublication(kids({ madeForKids: null }), channel(), "privatize", exists).failures).toEqual([]);
  });
});

describe("G7-k: the declaration to the child, spoken first and shown throughout (ruling 4.10 §4 rule 1)", () => {
  it("fails a script that does not open with the spoken declaration", () => {
    const body = " Some countries make much more power from the sun than others.";
    for (const script of [body.trim(), `Hello! ${KIDS_SPOKEN_DECLARATION}${body}`, ` ${KIDS_SPOKEN_DECLARATION}${body}`, KIDS_SPOKEN_DECLARATION.slice(0, -1) + body]) {
      expect(kidsFailures(kids({ script })).some((r) => /does not open with KIDS_SPOKEN_DECLARATION verbatim/.test(r)), script).toBe(true);
    }
  });

  it("fails unless the renderer asserted the tag on every frame", () => {
    for (const tag of [null, "", "Made by a computer program", "made by a computer program · computer voice · not a person"]) {
      expect(kidsFailures(kids({ onScreenTagEveryFrame: tag })).some((r) => /KIDS_ON_SCREEN_TAG/.test(r)), String(tag)).toBe(true);
    }
  });
});

describe("G7-k: the declaration to the parent (ruling 4.10 §4 rule 2)", () => {
  const data = `Data: ${DATASET}, licensed CC BY 4.0.`;
  it.each([
    ["the voice sentence first", [SYNTHETIC_VOICE_DISCLOSURE, KIDS_AUDIENCE_SENTENCE, data]],
    ["no audience sentence", [SYNTHETIC_VOICE_DISCLOSURE, data]],
    ["something between the two", [KIDS_AUDIENCE_SENTENCE, "Sunshine data for everyone.", SYNTHETIC_VOICE_DISCLOSURE, data]],
    ["a summary before the audience sentence", ["Which countries get the most sunshine?", KIDS_AUDIENCE_SENTENCE, SYNTHETIC_VOICE_DISCLOSURE, data]],
  ])("fails a description with %s", (_, parts) => {
    expect(kidsFailures(kids({ description: parts.join("\n\n") })).some((r) => /description opens with/.test(r))).toBe(true);
  });

  it("accepts the two sentences on one line or two", () => {
    expect(kidsFailures(kids({ description: `${KIDS_AUDIENCE_SENTENCE} ${SYNTHETIC_VOICE_DISCLOSURE} ${data}` }))).toEqual([]);
    expect(kidsFailures(kids({ description: `${KIDS_AUDIENCE_SENTENCE}\n${SYNTHETIC_VOICE_DISCLOSURE}\n${data}` }))).toEqual([]);
  });
});

describe("G7-k: English voices only, the 28 live keys (ruling 4.10 §5 rule 1)", () => {
  /** hexgrad's voices.js at dfb907a (P-1's frozen voice list): the live keys of VOICES, above the TODO at :210. */
  const src = readFileSync(resolve(ROOT, KOKORO_82M_VOICE_LICENCE.voiceList.path), "utf8");
  const live = [...src.matchAll(/^ {2}([a-z]{2}_[a-z]+): \{$/gm)].map((m) => m[1]!);

  it("KIDS_VOICES is exactly the live keys of the frozen voices.js, in its order", () => {
    expect(live).toHaveLength(28);
    expect([...KIDS_VOICES]).toEqual(live);
    // Every live key sits above the TODO line (:210) and speaks en-us or en-gb.
    const lines = src.split("\n");
    expect(lines[209]).toBe("  // TODO: Add support for other languages:");
    for (const id of live) {
      const at = lines.indexOf(`  ${id}: {`);
      expect(at, id).toBeGreaterThan(0);
      expect(at, id).toBeLessThan(209);
      expect(lines[at + 2], id).toMatch(/^ {4}language: "en-(us|gb)",$/);
    }
  });

  it("is a subset of P-1's allowlist: G7-k narrows the language, never the licence", () => {
    for (const id of KIDS_VOICES) expect(KOKORO_82M_VOICE_LICENCE.voices.has(id), id).toBe(true);
    expect(KIDS_VOICES.size).toBeLessThan(KOKORO_82M_VOICE_LICENCE.voices.size);
  });

  it.each(["ef_dora", "ff_siwis", "jf_alpha", "hf_alpha", "zf_xiaobei", "pm_alex"])("refuses %s on the kids line, though P-1 allows it", (voiceId) => {
    const r = run(kids({ narration: { ...kids().narration, voiceId } }));
    expect(r.filter((x) => x.startsWith("G7:P-1"))).toEqual([]);
    expect(r.some((x) => x.startsWith("G7:G7-k") && x.includes(voiceId) && /28 English/.test(x))).toBe(true);
  });

  it.each(["af_heart", "am_michael", "bf_emma", "bm_fable"])("accepts %s", (voiceId) => {
    expect(run(kids({ narration: { ...kids().narration, voiceId } }))).toEqual([]);
  });
});

describe("G7-k: no pre-reader, song, story, character or toy framing (ruling 4.10 §2 rule 2; ASSESSMENT.md:402-415)", () => {
  const excluded = [
    "Nursery rhymes about the sun",
    "Sunshine song",
    "Sing-along songs",
    "A rhyme about rain",
    "A bedtime story about clouds",
    "Rain stories",
    "A poem about snow",
    "Cartoon weather",
    "Meet our mascot",
    "Puppets explain rain",
    "Toy trains and rain",
    "Surprise egg weather",
    "Unboxing the weather",
    "Learn colours with rainbows",
    "Learning colors",
    "Learn numbers with rain",
    "ABC of weather",
    "Weather ABCs",
    "Preschool weather",
    "Weather for preschoolers",
    "Pre-school rain facts",
    "Rain for toddlers",
    "Kindergarten weather",
  ];

  it.each(excluded)("fails in the title: %s", (title) => {
    expect(kidsFailures(kids({ title })).some((r) => /title/.test(r))).toBe(true);
  });
  it.each(excluded)("fails in a tag: %s", (tag) => {
    expect(kidsFailures(kids({ tags: ["sunshine", tag] })).some((r) => /tag/.test(r))).toBe(true);
  });
  it.each(excluded)("fails in the description: %s", (line) => {
    expect(kidsFailures(kids({ description: `${kids().description}\n\n${line}` })).some((r) => /description/.test(r))).toBe(true);
  });

  // Whole words only (publication-gate.ts G2's lesson: "Whole words, not prefixes").
  it.each([
    "Storyline of a storm: the history of rain records",
    "Toyota and other car makers: electric cars by country",
    "Which cities have the most sunny days?",
    "How many numbered roads does each country have?",
    "Every number comes from real data",
    "Colours of the rainbow, measured",
    "Made for children who can read. This channel is set as made for kids.",
  ])("passes a text that only shares letters with an excluded word: %s", (title) => {
    expect(kidsFailures(kids({ title }))).toEqual([]);
  });

  // ASSESSMENT.md:411-415: Hebrew terms wrapped as (?<!\p{L})[ובהלמשכ]{0,2}TERM(?!\p{L}), with the u flag.
  it.each(["שירי ילדים על השמש", "שמש לפעוטות", "והפעוטות", "בגן ילדים", "הגננת מסבירה", "דמות מצוירת", "בובות ומזג אוויר"])(
    "fails the Hebrew pattern: %s",
    (tag) => {
      expect(kidsFailures(kids({ tags: [tag] })).some((r) => /tag/.test(r))).toBe(true);
    },
  );
  // The last is not a word: a non-prefix letter (ק) before a term, which the (?<!\p{L}) boundary must not let through.
  it.each(["מגן מפני השמש", "ארגון המדינות", "גנרי", "בובותיים", "פעוטותיהם", "קבובות"])("passes Hebrew that only contains a term's letters: %s", (tag) => {
    expect(kidsFailures(kids({ tags: [tag] }))).toEqual([]);
  });

  it("names the word and where it was found", () => {
    const r = kidsFailures(kids({ tags: ["sunshine", "Rain for toddlers"] }));
    expect(r.some((x) => x.includes('"toddlers"') && x.includes("tag 2"))).toBe(true);
  });

  it("checks every tag, and refuses tags that are not a list of strings", () => {
    expect(kidsFailures(kids({ tags: ["a", "b", "c", "cartoon"] })).length).toBeGreaterThan(0);
    expect(kidsFailures(kids({ tags: "sunshine" as unknown as string[] })).some((r) => /tags/.test(r))).toBe(true);
    expect(kidsFailures(kids({ tags: [7 as unknown as string] })).some((r) => /tags/.test(r))).toBe(true);
  });

  it("does not lint T1's metadata (G7-k is the kids line's)", () => {
    expect(run(t1({ title: "Rain stories by country" })).filter((r) => r.startsWith("G7:G7-k"))).toEqual([]);
  });
});

describe("G7-k: the thumbnail brief carries no child, character, mascot or toy (ruling 4.10 §2 rule 2)", () => {
  it.each([
    "A smiling child pointing at the chart",
    "Two kids looking at a bar chart",
    "A girl holding an umbrella",
    "A cartoon sun with a face",
    "Our mascot, a friendly cloud character",
    "A teddy bear beside the chart",
    "A toy car on the map",
    "A doll and a rain gauge",
    "ילד מסתכל על הגרף",
    "צעצוע ליד הגרף",
  ])("fails: %s", (thumbnailBrief) => {
    expect(kidsFailures(kids({ thumbnailBrief })).some((r) => /thumbnail brief/.test(r))).toBe(true);
  });

  it("passes a chart frame, and no custom thumbnail at all", () => {
    expect(kidsFailures(kids({ thumbnailBrief: "The ratio chart from scene two, with its title." }))).toEqual([]);
    expect(kidsFailures(kids({ thumbnailBrief: null }))).toEqual([]);
  });
});

describe("G7-k: the narrator says what it is, never a teacher or a friend (ruling 4.10 §2 rule 2, §4)", () => {
  it.each(["I am your teacher today.", "I'm your friend.", "Hi, your new friend here.", "I will be your teacher."])("fails: %s", (line) => {
    const script = `${KIDS_SPOKEN_DECLARATION} ${line} The chart shows rain by month.`;
    expect(kidsFailures(kids({ script })).some((r) => /teacher or a friend/.test(r))).toBe(true);
  });
  it("passes a teacher or a friend as a subject of the data", () => {
    const script = `${KIDS_SPOKEN_DECLARATION} Some countries have one teacher for every ten pupils.`;
    expect(kidsFailures(kids({ script }))).toEqual([]);
  });
});

describe("G9 on the kids line reads the kids experiment's caps", () => {
  it("fails over 60 runner minutes or ₪20 of tokens, naming the kids experiment's caps", () => {
    expect(run(kids({ runnerMinutes: 61 })).find((r) => r.startsWith("G9:"))).toMatch(/\(kids-explainers caps\)$/);
    expect(run(kids({ tokenCostIls: 21 })).find((r) => r.startsWith("G9:"))).toMatch(/\(kids-explainers caps\)$/);
    expect(run(kids({ runnerMinutes: 60, tokenCostIls: 20 }))).toEqual([]);
    expect(run(t1({ runnerMinutes: 61 })).find((r) => r.startsWith("G9:"))).toMatch(/\(faceless-youtube caps\)$/);
  });
});
