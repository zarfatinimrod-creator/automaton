/**
 * Revenue Colony — the publication gate for the colony's YouTube lines (VERDICT §12, G1-G10; G11 and G7-k from
 * research/channel-loop/RULING-2026-10-04-kids-youtube.md, for T1's line and the kids-explainers line).
 *
 * Every gate is a FAIL that blocks the action. The gate is code so that "we checked" is a result, not a memory:
 * the verdict names the failure modes (reused content, advice from a synthetic persona, a licence nobody read,
 * a number nobody re-computed), and this function refuses each of them before an upload call exists.
 *
 * What is mechanical here is checked here (licence snapshots on disk, cadence, caps, flags, attribution, textual
 * similarity, advice phrasing). What needs judgement — originality, fact-check, whether the first 30 seconds
 * deliver the title — is a verdict recorded by a separate auditor agent; this gate only insists that the verdict
 * exists, says PASS, and did not come from the author. Pure: the caller supplies `exists` for the file system.
 */

import { FACELESS_YOUTUBE_EXPERIMENT, KIDS_EXPLAINERS_EXPERIMENT, type ExperimentSpec } from "./experiments.js";

export type GateId = "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7" | "G8" | "G9" | "G10" | "G11";
export type ChannelAction = "publish" | "privatize" | "delete";

/** The colony's YouTube lines: T1's regular channel and the kids channel (ruling 4.10 §2 rule 1, §7 rule 1). */
export type YoutubeLine = "faceless-youtube" | "kids-explainers";

/**
 * Each line's experiment: the audience its uploads declare (G11, `declaresMadeForKids`) and the per-video caps (G9). A
 * manifest's `line` picks one; a line not listed here publishes nothing.
 */
export const EXPERIMENT_BY_LINE: Readonly<Record<YoutubeLine, ExperimentSpec>> = {
  "faceless-youtube": FACELESS_YOUTUBE_EXPERIMENT,
  "kids-explainers": KIDS_EXPLAINERS_EXPERIMENT,
};

export interface DatasetUse {
  /** As it must appear in the description, e.g. "Our World in Data, CO2 and Greenhouse Gas Emissions". */
  name: string;
  /** SPDX-style id of the licence the publisher states, or null when unknown. */
  licence: string | null;
  /** Repo path of the stored licence text (a render-watch capture or a GitHub LICENSE). */
  licenceSnapshot: string | null;
  /**
   * Third-party series inside a derived dataset keep their own licences (OWID says so). List the upstream source of
   * every indicator the video actually uses, not of the whole file: owid/co2-data carries Global Carbon Project
   * emissions beside Energy Institute energy columns, and only the columns used decide the gate.
   */
  upstream: { source: string; licence: string | null }[];
  /**
   * The licensor's name as it must appear in the no-endorsement sentence, e.g. "United Nations". Required when the
   * licence is in IGO_LICENCES (LICENCE-IGO-DECISION.md, condition C3); ignored otherwise.
   */
  licensor?: string;
}

export interface AuditVerdict {
  auditor: string;
  verdict: "PASS" | "FAIL";
}

export interface VideoManifest {
  id: string;
  /** The agent that wrote the script. Auditors must be someone else. */
  author: string;
  /** Which YouTube line the video is for (ruling 4.10 §2 rule 1): decides G11's designation, G7-k and G9's caps. */
  line: YoutubeLine;
  title: string;
  description: string;
  /** The tags the publisher sends, exactly; [] = none. G7-k lints them on the kids line. */
  tags: string[];
  /** The brief for a custom thumbnail; null = none (YouTube shows a frame of the video). G7-k lints it on the kids line. */
  thumbnailBrief: string | null;
  topic: string;
  /** The narration, exactly as it will be spoken. */
  script: string;
  datasets: DatasetUse[];
  originality: AuditVerdict | null;
  factCheck: (AuditVerdict & { figuresChecked: number }) | null;
  promiseMatch: AuditVerdict | null;
  /** YouTube's altered-or-synthetic flag: must be decided, and for this video class the board ruled `true` (G7). */
  containsSyntheticMedia: boolean | null;
  /**
   * `status.selfDeclaredMadeForKids` as the publisher will send it (G11, ruling 4.10 §6 rule 1): `true` on the kids line,
   * `false` on T1's, never `null` ("never decided" fails, as G7's flag does).
   */
  madeForKids: boolean | null;
  /**
   * The tag the renderer burned into every frame and asserted on every frame, or null when it drew none. On the kids line
   * it must be KIDS_ON_SCREEN_TAG (G7-k, ruling 4.10 §4 rule 1(ii)); products/chart-explainer writes it.
   */
  onScreenTagEveryFrame: string | null;
  /**
   * What speaks. Only an engine in ALLOWED_NARRATION_ENGINES passes; a voice imitating a real person is never made (§2c).
   * P-1: `voiceId` must be one of the engine's official voices (NARRATION_VOICE_LICENCES). `voicesFile` and `modelFile`
   * are the file names of the voice archive and the model the renderer loaded, and must be the engine's pinned ones: a
   * non-commercial export ships its own archive and model (yk2-hf-kokoro-hebrew-nc.txt:68, :70), so a manifest that
   * names neither cannot show which it used and is refused. The chart-explainer writes both from tts.py's pins.
   */
  narration: { engine: string; voiceId: string; voicesFile: string; modelFile: string };
  scheduledAt: string;
  runnerMinutes: number;
  tokenCostIls: number;
}

export interface ChannelState {
  published: { id: string; publishedAt: string; script: string }[];
  yppReviewPending: boolean;
  dmcaCounterNoticeFiled: boolean;
  /**
   * Licensors who have sent any notice about our use of their data (CC BY 3.0 IGO §4(a) credit removal, §7(b) cure,
   * §8(h) "settled amicably"). While one is open, nothing using that licensor's data publishes; the board closes it
   * (LICENCE-IGO-DECISION.md, condition C5). Optional so existing channel states keep working.
   */
  openLicensorNotices?: string[];
}

export interface GateFailure {
  gate: GateId;
  reason: string;
}

export interface GateResult {
  pass: boolean;
  failures: GateFailure[];
}

/**
 * Licences a narrated chart video can carry with attribution alone. ShareAlike and NonCommercial are out.
 *
 * `Unlicense` and `ODC-PDDL-1.0` were added 27.9.2026 (DATASETS.md B2): both are public-domain dedications, no
 * stricter than `public-domain`, and a manifest records the licence string the source actually uses rather than our
 * mapping of it. `MIT` stays out: it licenses "the Software", and on a data repository it is the packager's licence
 * for the code, not the producer's statement about the data (R7, R8) — so it is UNKNOWN in substance, not merely
 * inconvenient (Fable, B2 ruling, LICENCE-IGO-DECISION.md §5).
 *
 * `CC-BY-3.0-IGO` was added 27.9.2026 by Fable ruling (research/faceless-youtube/LICENCE-IGO-DECISION.md). Its grant
 * (§3: worldwide, royalty-free, Distribute "by sale", Adaptations) and its attribution clause (§4(b)) are CC BY 3.0's.
 * What is IGO-specific — §8(g) no waiver of the licensor's privileges and immunities, §8(h) mediation then
 * arbitration at the licensor's headquarters, §4(a) credit removal "inclusive of any logo, trademark, official mark
 * or official emblem" on notice — only bites a licensee that contests, and G8 says this channel never contests.
 * The conditions it carries are enforced below for every licence in IGO_LICENCES.
 */
export const ALLOWED_DATA_LICENCES: ReadonlySet<string> = new Set([
  "CC0-1.0",
  "CC-BY-4.0",
  "CC-BY-3.0",
  "CC-BY-3.0-IGO",
  "public-domain",
  "Unlicense",
  "ODC-PDDL-1.0",
]);

/**
 * YouTube's altered-or-synthetic flag for this video class — charts drawn by code plus Kokoro narration: `true`.
 * Board ruling 27.9.2026, research/faceless-youtube/PREREG-DECISIONS.md §2a. The narration is synthetic media by the
 * API field's own name (youtube-api-revision-history.txt:245, :401-405); a human-sounding voice is what the disclosure is
 * for (youtube-altered-synthetic-disclosure.txt:61); disclosing costs nothing (:173) and the label for non-photorealistic
 * content lands in the description (:171). The publisher's node defaults the field to false (T1-PROTOCOL.md), so G7
 * checks the value, not only that it was decided.
 */
export const CHART_TTS_SYNTHETIC_MEDIA = true;

/**
 * The sentence every description carries verbatim (PREREG-DECISIONS.md §2b), beside the data attribution G7 already
 * requires. The platform label only "may appear" (disclosure.txt:171); this one is ours and always there.
 */
export const SYNTHETIC_VOICE_DISCLOSURE =
  "Narration: a synthetic voice (Kokoro text-to-speech), not a recording of any person and not an imitation of anyone. " +
  "Charts are drawn by code from the data cited below. Produced with AI systems.";

/**
 * The kids line's declaration, to the child, spoken first: the opening of every kids-explainers narration, verbatim
 * (research/channel-loop/RULING-2026-10-04-kids-youtube.md §4 rule 1(i)). G7-k checks the script starts with it.
 * products/chart-explainer/manifest.py mirrors it, and tests/test_manifest.py fails if the two drift.
 */
export const KIDS_SPOKEN_DECLARATION =
  "This video was made by a computer program, not by a person. The voice is a computer voice, not a real person. " +
  "Every number comes from real data, listed under the video.";

/**
 * The kids line's declaration, to the child, shown throughout: the English tag the renderer burns into every frame, never
 * only on an end card (ruling 4.10 §4 rule 1(ii)). G7-k checks the manifest's `onScreenTagEveryFrame` equals it.
 */
export const KIDS_ON_SCREEN_TAG = "Made by a computer program · computer voice · not a person";

/**
 * The kids line's declaration to the parent: the description's first sentence, followed directly by
 * SYNTHETIC_VOICE_DISCLOSURE, then the data attribution G7 requires (ruling 4.10 §4 rule 2). Saying "made for kids" in the
 * metadata matches the designation G11 checks; a mismatch is what YouTube names (§4 rule 2).
 */
export const KIDS_AUDIENCE_SENTENCE = "Made for children who can read. This channel is set as made for kids.";

/**
 * Narration engines whose stock voices are nobody's (PREREG-DECISIONS.md §2c). Kokoro's training excluded "custom voice
 * clones" (research/rendered/kokoro-82m-model-card-2026-09-29.txt:245; the live capture's line moves with each render).
 * A cloning engine, or a voice that imitates an identifiable person, cannot pass this gate with or without the flag: such
 * a video is never made. Every engine here must also have a record in NARRATION_VOICE_LICENCES, or P-1 refuses it
 * (narration-licence-gate.test.ts pins both).
 */
export const ALLOWED_NARRATION_ENGINES: ReadonlySet<string> = new Set(["kokoro-82m"]);

/** A line of a stored capture and the words on it that the gate relies on. A test reopens every one. */
export interface CapturedLine {
  path: string;
  line: number;
  quote: string;
}

/** A model file the renderer downloads and verifies by sha256 before use, and records by name in the manifest. */
export interface PinnedModelFile {
  file: string;
  sha256: string;
  /** The renderer sources that pin it; a test reads each one for both values. */
  pinnedIn: readonly string[];
}

/**
 * P-1's record for one narration engine (research/channel-loop/RULING-2026-09-30-video.md 16(c) item 7): the rendered
 * evidence the ruling requires, the voices it covers, and the files a manifest must name.
 */
export interface NarrationVoiceLicence {
  engine: string;
  /**
   * Fold step 10's `licenceEvidence`: the weights licence and the training-data statement, both rendered. The author's
   * rendered statement counts for the training data; demanding the upstream providers' terms is a regress (ruling). P-1
   * refuses an engine whose record leaves either list empty.
   */
  licenceEvidence: { weightsLicence: readonly CapturedLine[]; trainingData: readonly CapturedLine[] };
  /** How many voices the release says it has. */
  voiceCount: CapturedLine;
  /** The model author's own repository, as the model card names it. */
  authorRepo: CapturedLine;
  /** The author's own list of voice ids, frozen at a commit: `voices` is asserted equal to it. */
  voiceList: { path: string; sha256: string; url: string };
  /** The voice archive and the model file the renderer loads; the manifest must name both (`voicesFile`, `modelFile`). */
  archive: PinnedModelFile;
  model: PinnedModelFile;
  voices: ReadonlySet<string>;
  ruling: string;
}

/** The dated frozen copy of the model card (its meta says why): the weekly render rewrites the live capture's lines. */
const KOKORO_CARD = "research/rendered/kokoro-82m-model-card-2026-09-29.txt";

/**
 * P-1, the narration-licence gate (ruling 30.9 16(c) item 7, adopted 30.9.2026): narration only from a voice whose weights
 * licence and training-data statement are both rendered. Kokoro-82M's official voices are the one set that passes today.
 *
 * `voices` are the 54 ids of hexgrad's own `kokoro.js/src/voices.js` at commit dfb907a (`voiceList`; 28 live keys and 26
 * more commented out under "TODO: Add support for other languages"), fetched from GitHub on 30.9.2026. hexgrad/kokoro is
 * the repository the model card names as its own (`authorRepo`, :99), and the card's release table gives v1.0 "8 & 54"
 * languages and voices (`voiceCount`). The same 54 ids are the keys of the voice archive both Kokoro products pin by
 * sha256 (`archive`; re-listed from the pinned file on 30.9.2026 — the file is downloaded, never committed). The archive
 * is a third party's packaging (thewh1teagle/kokoro-onnx, the same publisher as the refused Hebrew export), which is why
 * the names are checked against the author's list and not taken from the archive. A blend such as "af_bella,af_jessica"
 * is not an official voice id and does not pass. The card's own voice list (VOICES.md, :119) sits on huggingface.co and
 * is not captured.
 *
 * The ruling's pointers were :235 and :241 of the live capture; the frozen copy carries the same text on the same lines
 * (the training-data statement), and the weights licence is on :53 and :97. The card's CC BY table, under "The following
 * CC BY audio was part of the dataset used to train Kokoro v1.0." (:253), joined the record on 4.10.2026
 * (research/channel-loop/RULING-2026-10-04-kids-youtube.md §5 rule 2): "Koniwa tnc" (:263) under "CC BY 3.0" (:267) and
 * "SIWIS" (:271) under "CC BY 4.0" (:275). CC BY permits commercial use with attribution, which the author's card gives;
 * one set of weights trained on one dataset, so every voice id is downstream of that audio equally and no voice is struck
 * alone. REOPEN (§5 rule 2): a rendered CC BY text or licensor's statement, from a permitted host, saying attribution
 * attaches to a model's output — then every voice is affected together and the attribution joins the fixed description.
 *
 * REOPEN (ruling, "What stays open" 9): if a rendered term of a named upstream TTS provider bars reuse of its synthetic
 * audio for commercial training, the premise behind `licenceEvidence.trainingData` falls, and with it this allowlist.
 */
export const KOKORO_82M_VOICE_LICENCE: NarrationVoiceLicence = {
  engine: "kokoro-82m",
  licenceEvidence: {
    weightsLicence: [
      { path: KOKORO_CARD, line: 53, quote: "License: apache-2.0" },
      { path: KOKORO_CARD, line: 97, quote: "With Apache-licensed weights" },
    ],
    trainingData: [
      { path: KOKORO_CARD, line: 235, quote: "Kokoro was trained exclusively on permissive/non-copyrighted audio data" },
      { path: KOKORO_CARD, line: 241, quote: "Synthetic audio [1] generated by closed [2] TTS models from large providers" },
      { path: KOKORO_CARD, line: 263, quote: "Koniwa tnc" },
      { path: KOKORO_CARD, line: 267, quote: "CC BY 3.0" },
      { path: KOKORO_CARD, line: 271, quote: "SIWIS" },
      { path: KOKORO_CARD, line: 275, quote: "CC BY 4.0" },
    ],
  },
  voiceCount: { path: KOKORO_CARD, line: 147, quote: "8 & 54" },
  authorRepo: { path: KOKORO_CARD, line: 99, quote: "GitHub : https://github.com/hexgrad/kokoro" },
  voiceList: {
    path: "research/rendered/hexgrad-kokoro-voices-js-dfb907a.txt",
    sha256: "7650e788fcf0e2dfc6ad13ef185f3f1d1362b4360e3623e1ba39a699b376d201",
    url: "https://raw.githubusercontent.com/hexgrad/kokoro/dfb907a02bba8152ca444717ca5d78747ccb4bec/kokoro.js/src/voices.js",
  },
  archive: {
    file: "voices-v1.0.bin",
    sha256: "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
    pinnedIn: ["products/chart-explainer/tts.py", "products/parent-guides/tts.py"],
  },
  model: {
    file: "kokoro-v1.0.onnx",
    sha256: "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5",
    pinnedIn: ["products/chart-explainer/tts.py", "products/parent-guides/tts.py"],
  },
  voices: new Set([
    "af_alloy", "af_aoede", "af_bella", "af_heart", "af_jessica", "af_kore", "af_nicole", "af_nova", "af_river", "af_sarah",
    "af_sky", "am_adam", "am_echo", "am_eric", "am_fenrir", "am_liam", "am_michael", "am_onyx", "am_puck", "am_santa",
    "bf_alice", "bf_emma", "bf_isabella", "bf_lily", "bm_daniel", "bm_fable", "bm_george", "bm_lewis",
    "ef_dora", "em_alex", "em_santa", "ff_siwis", "hf_alpha", "hf_beta", "hm_omega", "hm_psi", "if_sara", "im_nicola",
    "jf_alpha", "jf_gongitsune", "jf_nezumi", "jf_tebukuro", "jm_kumo", "pf_dora", "pm_alex", "pm_santa",
    "zf_xiaobei", "zf_xiaoni", "zf_xiaoxiao", "zf_xiaoyi", "zm_yunjian", "zm_yunxi", "zm_yunxia", "zm_yunyang",
  ]),
  ruling: "research/channel-loop/RULING-2026-09-30-video.md 16(c) item 7 (P-1)",
};

/**
 * The voices the kids line narrates with (G7-k, ruling 4.10 §5 rule 1): the 28 live keys of hexgrad's voices.js at
 * dfb907a (KOKORO_82M_VOICE_LICENCE.voiceList), every one `en-us` or `en-gb`, in the file's order. They sit at :5-208 of
 * the frozen copy, above the "TODO: Add support for other languages:" line at :210 (the ruling cites :7-203). A subset of
 * P-1's allowlist: G7-k narrows the language for this line; P-1 is a licence gate and is not narrowed.
 */
export const KIDS_VOICES: ReadonlySet<string> = new Set([
  "af_heart", "af_alloy", "af_aoede", "af_bella", "af_jessica", "af_kore", "af_nicole", "af_nova", "af_river", "af_sarah",
  "af_sky", "am_adam", "am_echo", "am_eric", "am_fenrir", "am_liam", "am_michael", "am_onyx", "am_puck", "am_santa",
  "bf_emma", "bf_isabella", "bm_george", "bm_lewis", "bf_alice", "bf_lily", "bm_daniel", "bm_fable",
]);

/** P-1's record per narration engine. An engine without one narrates nothing, whatever ALLOWED_NARRATION_ENGINES says. */
export const NARRATION_VOICE_LICENCES: Readonly<Record<string, NarrationVoiceLicence>> = {
  [KOKORO_82M_VOICE_LICENCE.engine]: KOKORO_82M_VOICE_LICENCE,
};

/**
 * Voices and voice archives refused by name (P-1), with the line that refuses them. Checked first, against every name the
 * narration carries (engine, voice, archive, model), whatever the engine string says.
 */
export const REFUSED_NARRATION_VOICES: Readonly<Record<string, string>> = {
  he_shaul:
    'the Hebrew community voice of kokoro-hebrew-nc: "Non-commercial Hebrew Kokoro ONNX export." ' +
    '(research/rendered/yk2-hf-kokoro-hebrew-nc.txt:60), converted from "the gated non-commercial model" (:62) and ' +
    '"subject to the original model and dataset terms" (:64)',
  "voices-hebrew.bin":
    'the archive that carries he_shaul: "voices-hebrew.bin - kokoro-onnx compatible voice archive with he_shaul ." ' +
    '(research/rendered/yk2-hf-kokoro-hebrew-nc.txt:70) in a "Non-commercial Hebrew Kokoro ONNX export." (:60)',
};

/** The file name of a recorded path, or undefined when the manifest recorded none (JSON may carry anything). */
const fileName = (p: unknown): string | undefined => (typeof p === "string" && p !== "" ? p.split(/[\\/]/).pop() : undefined);

/** P-1 on one narration: the reasons it may not speak in a published video, empty when it may. */
function narrationLicenceFailures(n: VideoManifest["narration"]): string[] {
  const out: string[] = [];
  const archive = fileName(n.voicesFile);
  const model = fileName(n.modelFile);
  for (const name of new Set([n.engine, n.voiceId, archive, model])) {
    if (typeof name === "string" && Object.hasOwn(REFUSED_NARRATION_VOICES, name)) {
      out.push(`P-1: narration "${name}" is refused by name — ${REFUSED_NARRATION_VOICES[name]}`);
    }
  }
  if (out.length) return out;
  const rec = Object.hasOwn(NARRATION_VOICE_LICENCES, n.engine) ? NARRATION_VOICE_LICENCES[n.engine] : undefined;
  if (!rec) {
    return [`P-1: engine "${n.engine}" has no narration-licence record: no rendered weights licence and training-data statement cover its voices`];
  }
  const { weightsLicence, trainingData } = rec.licenceEvidence;
  if (weightsLicence.length === 0 || trainingData.length === 0) {
    out.push(`P-1: engine "${n.engine}" lacks a rendered ${weightsLicence.length === 0 ? "weights licence" : "training-data statement"} (${rec.ruling})`);
  }
  if (!rec.voices.has(n.voiceId)) {
    out.push(
      `P-1: voice "${n.voiceId}" is not one of ${n.engine}'s official voices; only a voice whose weights licence and ` +
        `training-data statement are both rendered narrates (${rec.ruling})`,
    );
  }
  for (const [what, got, want] of [
    ["voice archive", archive, rec.archive.file],
    ["model file", model, rec.model.file],
  ] as const) {
    if (got === undefined) out.push(`P-1: the manifest does not record the ${what}; only the pinned ${want} passes, so an unnamed one is refused`);
    else if (got !== want) out.push(`P-1: ${what} "${got}" is not ${want}, the file ${n.engine}'s licence record pins`);
  }
  return out;
}

/**
 * Licences whose licensor is (or may be) an intergovernmental organisation (CC BY 3.0 IGO §1(a), §1(c)). A dataset
 * under one of these carries the conditions of LICENCE-IGO-DECISION.md §4, checked in G1 and G7:
 *   C1 the snapshot is the licensor's own page, rendered by render-watch — never a third party's record of it
 *      (owid/etl's UNESCO records say "CC BY 3.0 IGO" beside a by-sa/3.0/igo URL; a record can be wrong);
 *   C2 the description carries the licence URI (§4(a)) and a changes-made statement (§3(b));
 *   C3 the description carries the no-endorsement sentence naming the licensor (§4(b), last sentence);
 *   C4 the licensor's name and short forms stay out of the title (§4(b): the credit is "only ... for the purpose of
 *      attribution"); no logo, emblem or official mark anywhere (§4(a));
 *   C5 an open notice from the licensor blocks everything that uses its data until the board closes it.
 */
export const IGO_LICENCES: ReadonlySet<string> = new Set(["CC-BY-3.0-IGO"]);
/** §4(a): "You must include a copy of, or the Uniform Resource Identifier (URI) for, this License with every copy". */
export const CC_BY_3_0_IGO_URI = "https://creativecommons.org/licenses/by/3.0/igo/";
/** C3, verbatim with the licensor's name substituted; G7 checks the description for it. */
export const igoNoEndorsementSentence = (licensor: string): string =>
  `${licensor} did not produce, endorse or approve this video, and no affiliation with ${licensor} is claimed.`;
/** C2: §3(b) "clearly label, demarcate or otherwise identify that changes were made to the original Work". */
const CHANGES_MADE = /\b(computed|derived|calculated|adapted|re-?computed) from\b/i;
/** C4: short forms of the IGO licensors the channel uses; "UN" and "UIS" are case-sensitive on purpose. */
const IGO_SHORT_NAMES = /\b(UN|U\.N\.|UNDESA|UNESCO|UIS)\b/;
/** C1: a render-watch capture lives here (research/rendered/README.md); a GitHub file or a .dvc record does not. */
const RENDERED_PREFIX = "research/rendered/";

/**
 * Topics the verdict keeps the channel away from in any form that could read as advice (VERDICT §11, G2).
 * Whole words, not prefixes: the first version matched "taxonomy", "lawn" and "global warming" (found by the dataset
 * research, DATASETS.md, 27.9.2026). A false block is the safe error, but a gate that blocks harmless topics gets
 * worked around, which is worse.
 */
const SENSITIVE_TOPIC = new RegExp(
  "\\b(" +
    [
      "financ(e|es|ial|ing)",
      "invest(s|ed|ing|ment|ments|or|ors)?",
      "stocks",
      "stock (market|markets|price|prices|exchange|exchanges)",
      "crypto(currency|currencies)?",
      "tax(es|ation|ed)?",
      "health(care)?",
      "medic(al|ine|ines|ation|ations)",
      "diseases?",
      "drugs?",
      "legal",
      "laws?",
      "lawyers?",
      "courts?",
      "politic(s|al|ian|ians)",
      "elections?",
      "vot(e|es|ed|ing|er|ers)",
      "wars?",
      "warfare",
      "religio(n|ns|us)",
      "immigra(nt|nts|tion)",
      "migrants?",
      "migration",
    ].join("|") +
    ")\\b",
  "i",
);

/** Second-person advice and recommendation phrasing. The production-stack scout's own benchmark script failed this. */
const ADVICE = [
  /\byou (should|must|ought to|have to|need to)\b/i,
  /\b(we|i) (recommend|advise|suggest)\b/i,
  /\bconsult (a|an|your|with)\b/i,
  /\b(talk|speak) to (a|an|your) (doctor|lawyer|advisor|adviser|accountant)\b/i,
];

/**
 * The framings the kids line excludes as decisions not to act (ruling 4.10 §2 rule 2): songs, rhymes, stories or poems for
 * children; cartoon characters, mascots, puppets, toys, surprise eggs, unboxing; "learn colours", "ABC", "numbers" and any
 * preschool or toddler framing. Read against research/youtube-kids/ASSESSMENT.md's G11 list (:402-405), whose English
 * terms are all covered here (nursery rhyme(s), toddler(s), preschool(er), baby song(s), ABC song, learn colo(u)rs,
 * cartoon, mascot, puppet(s), surprise egg(s), toy unboxing). Whole words, not prefixes (G2's lesson): "history",
 * "storyline" and "Toyota" pass. "numbers" is read as the preschool framing "learn numbers" (a numbers song is a song):
 * a kids explainer's own metadata names its numbers ("Every number comes from real data"), so the bare word would block
 * the line's honest attribution — a reading of the ruling, recorded in logs/2026-10-04-fold-row-23-code.md.
 */
const KIDS_EXCLUDED_EN = new RegExp(
  "\\b(" +
    [
      "songs?",
      "rhymes?",
      "stor(y|ies)",
      "poems?",
      "cartoons?",
      "mascots?",
      "puppets?",
      "toys?",
      "surprise eggs?",
      "unboxing",
      "learn(ing)? (the |your |our )?colou?rs",
      "learn(ing)? (the |your |our )?numbers",
      "abcs?",
      "pre-?school(ers?)?",
      "toddlers?",
      "nursery",
      "kindergarten",
    ].join("|") +
    ")\\b",
  "i",
);

/**
 * A Hebrew term as a whole word with up to two one-letter prefixes (ASSESSMENT.md:411-415): JavaScript's \b does not see
 * Hebrew letters as word characters, so a term is bounded by "no letter" on each side, with the `u` flag.
 */
const hebrewWords = (terms: readonly string[]) =>
  new RegExp(terms.map((t) => `(?<!\\p{L})[ובהלמשכ]{0,2}${t}(?!\\p{L})`).join("|"), "u");
/** ASSESSMENT.md:403-405's Hebrew terms. There is no bare גן: as a substring it hits מגן, ארגון and גנרי. */
const KIDS_EXCLUDED_HE = hebrewWords(["שירי ילדים", "פעוטות", "גן ילדים", "גננת", "דמות מצוירת", "בובות"]);

/** "Child figures or characters in thumbnails" (ruling 4.10 §2 rule 2): any child, character, mascot or toy in the brief. */
const THUMBNAIL_EXCLUDED_EN =
  /\b(child|children|kids?|boys?|girls?|bab(y|ies)|toddlers?|characters?|cartoons?|mascots?|puppets?|toys?|dolls?|teddy)\b/i;
const THUMBNAIL_EXCLUDED_HE = hebrewWords(["ילד", "ילדה", "ילדים", "ילדות", "דמות", "דמויות", "בובה", "בובות", "צעצוע", "צעצועים", "קמע"]);

/** "A narrator posing as a teacher or friend" (ruling 4.10 §2 rule 2): the narrator says what it is (§4). */
const NARRATOR_PERSONA = /\b((i am|i'm|i will be|i'll be) (your|a) (new )?(teacher|friend)|your (new |best )?(teacher|friend))\b/i;

/** The first excluded word in a text, or null. */
const excludedWord = (text: string, ...patterns: RegExp[]): string | null => {
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[0];
  }
  return null;
};

/** G7-k (ruling 4.10 §4, §5 rule 1, §2 rule 2): the kids line's own checks. Empty when the manifest passes them. */
function kidsLineFailures(video: VideoManifest): string[] {
  const out: string[] = [];
  if (typeof video.script !== "string" || !video.script.startsWith(KIDS_SPOKEN_DECLARATION)) {
    out.push("G7-k: the narration script does not open with KIDS_SPOKEN_DECLARATION verbatim (§4 rule 1(i))");
  }
  if (video.onScreenTagEveryFrame !== KIDS_ON_SCREEN_TAG) {
    out.push(`G7-k: the renderer did not assert KIDS_ON_SCREEN_TAG on every frame (onScreenTagEveryFrame is ${JSON.stringify(video.onScreenTagEveryFrame)}; §4 rule 1(ii))`);
  }
  const afterAudience = video.description.startsWith(KIDS_AUDIENCE_SENTENCE)
    ? video.description.slice(KIDS_AUDIENCE_SENTENCE.length).trimStart()
    : null;
  if (afterAudience === null || !afterAudience.startsWith(SYNTHETIC_VOICE_DISCLOSURE)) {
    out.push("G7-k: the description opens with KIDS_AUDIENCE_SENTENCE and then SYNTHETIC_VOICE_DISCLOSURE, verbatim, or not at all (§4 rule 2)");
  }
  if (!KIDS_VOICES.has(video.narration.voiceId)) {
    out.push(`G7-k: voice "${video.narration.voiceId}" is not one of the 28 English live keys of voices.js the kids line narrates with (KIDS_VOICES; §5 rule 1)`);
  }
  const tags: unknown = video.tags;
  const tagList = Array.isArray(tags) && tags.every((t) => typeof t === "string") ? (tags as string[]) : null;
  if (tagList === null) out.push("G7-k: tags must be a list of strings, so each can be checked");
  const metadata: [string, string][] = [
    ["the title", video.title],
    ["the description", video.description],
    ...(tagList ?? []).map((t, i): [string, string] => [`tag ${i + 1}`, t]),
  ];
  for (const [where, text] of metadata) {
    const word = excludedWord(text, KIDS_EXCLUDED_EN, KIDS_EXCLUDED_HE);
    if (word) out.push(`G7-k: ${where} carries "${word}", a framing the kids line excludes (songs, stories, characters, toys, pre-readers; §2 rule 2)`);
  }
  if (video.thumbnailBrief !== null) {
    const word = excludedWord(String(video.thumbnailBrief), THUMBNAIL_EXCLUDED_EN, THUMBNAIL_EXCLUDED_HE);
    if (word) out.push(`G7-k: the thumbnail brief carries "${word}": no child, character, mascot or toy in a thumbnail (§2 rule 2)`);
  }
  const persona = typeof video.script === "string" ? video.script.match(NARRATOR_PERSONA) : null;
  if (persona) out.push(`G7-k: the narrator poses as a teacher or a friend ("${persona[0]}"); it says what it is (§2 rule 2, §4)`);
  return out;
}

const SEVEN_DAYS_MS = 7 * 86_400_000;
const MAX_PER_SEVEN_DAYS = 2;
/** Word-trigram Jaccard at or above this against any published script = not materially varied. */
const MAX_SIMILARITY = 0.5;

const normLicence = (s: string) => s.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

function trigrams(text: string): Set<string> {
  const words = text.toLowerCase().replace(/[^a-z0-9%.\s]/g, " ").split(/\s+/).filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + 2 < words.length; i++) out.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  return out;
}

function similarity(a: string, b: string): number {
  const x = trigrams(a);
  const y = trigrams(b);
  if (x.size === 0 || y.size === 0) return 0;
  let shared = 0;
  for (const t of x) if (y.has(t)) shared++;
  return shared / (x.size + y.size - shared);
}

export function checkPublication(
  video: VideoManifest,
  channel: ChannelState,
  action: ChannelAction,
  exists: (repoPath: string) => boolean,
): GateResult {
  const failures: GateFailure[] = [];
  const fail = (gate: GateId, reason: string) => failures.push({ gate, reason });

  // G8 — a counter-notice is never filed; once one exists nothing else moves until the board has looked.
  if (channel.dmcaCounterNoticeFiled) fail("G8", "a DMCA counter-notice exists on this channel; the policy is never to file one");

  // G10 — no privacy changes or deletions while a YPP application is pending [ypp-overview:209].
  if (action !== "publish") {
    if (channel.yppReviewPending) fail("G10", `no ${action} while a YPP review is pending`);
    return { pass: failures.length === 0, failures };
  }

  // G1 — a licence snapshot for every dataset; UNFETCHABLE is FAIL; upstream licences must be known and allowed.
  if (video.datasets.length === 0) fail("G1", "no dataset: every number must be computed from raw data");
  for (const d of video.datasets) {
    if (!d.licenceSnapshot || !exists(d.licenceSnapshot)) {
      fail("G1", `${d.name}: licence snapshot ${d.licenceSnapshot ?? "(none)"} is UNFETCHABLE — no snapshot, no publish`);
    }
    if (!d.licence || !ALLOWED_DATA_LICENCES.has(d.licence)) {
      fail("G1", `${d.name}: licence ${d.licence ?? "unknown"} is not one a narrated video can carry with attribution alone`);
    }
    for (const u of d.upstream) {
      if (!u.licence || !ALLOWED_DATA_LICENCES.has(u.licence)) {
        fail("G1", `${d.name}: upstream source ${u.source} has licence ${u.licence ?? "UNKNOWN"} — the derived dataset does not override it`);
      }
    }
    if (d.licence && IGO_LICENCES.has(d.licence)) {
      // C1 — the licensor's own page, rendered. OWID's record of UNESCO says BY beside a BY-SA URL; a record is not the licence.
      if (!d.licenceSnapshot?.startsWith(RENDERED_PREFIX)) {
        fail("G1", `${d.name}: an IGO licence needs the licensor's own terms page rendered under ${RENDERED_PREFIX}, not a third party's record`);
      }
      if (!d.licensor) fail("G1", `${d.name}: an IGO licence needs \`licensor\` set for the no-endorsement sentence`);
      // C5 — a notice from the licensor is open: nothing that uses its data moves until the board has looked.
      if (d.licensor && (channel.openLicensorNotices ?? []).includes(d.licensor)) {
        fail("G1", `${d.name}: a notice from ${d.licensor} is open; comply first, publish after the board closes it`);
      }
    }
  }

  // G2 — no sensitive topic, no second-person advice.
  if (SENSITIVE_TOPIC.test(video.topic)) fail("G2", `topic "${video.topic}" is inside the health/legal/finance/politics set`);
  for (const re of ADVICE) {
    const m = video.script.match(re);
    if (m) fail("G2", `advice phrasing in the script: "${m[0]}"`);
  }

  // G3 — originality verdict from an auditor, and materially varied from everything already published.
  if (!video.originality || video.originality.verdict !== "PASS" || video.originality.auditor === video.author) {
    fail("G3", "no originality PASS from an auditor other than the author");
  }
  for (const p of channel.published) {
    const s = similarity(video.script, p.script);
    if (s >= MAX_SIMILARITY) fail("G3", `script is ${(s * 100).toFixed(0)}% trigram-similar to published ${p.id}; the substance must be materially varied`);
  }

  // G4 — every figure re-computed by a separate auditor against the CSV.
  const fc = video.factCheck;
  if (!fc || fc.verdict !== "PASS" || fc.auditor === video.author || fc.figuresChecked < 1) {
    fail("G4", "no fact-check PASS covering at least one figure, from an auditor other than the author");
  }

  // G5 — the first 30 seconds deliver what the title promises.
  if (!video.promiseMatch || video.promiseMatch.verdict !== "PASS" || video.promiseMatch.auditor === video.author) {
    fail("G5", "no promise-match PASS from an auditor other than the author");
  }

  // G6 — at most two uploads in any seven days, this one included.
  const at = Date.parse(video.scheduledAt);
  const recent = channel.published.filter((p) => {
    const t = Date.parse(p.publishedAt);
    return t <= at && at - t < SEVEN_DAYS_MS;
  });
  if (recent.length + 1 > MAX_PER_SEVEN_DAYS) {
    fail("G6", `${recent.length} upload(s) in the 7 days before ${video.scheduledAt}; at most ${MAX_PER_SEVEN_DAYS} per 7 days`);
  }

  // G7 — the synthetic-media flag as the board ruled, the voice disclosure sentence, a nobody's-voice engine, and every
  // dataset attributed with its licence in the description (PREREG-DECISIONS.md §2).
  if (video.containsSyntheticMedia === null) fail("G7", "containsSyntheticMedia was never decided");
  else if (video.containsSyntheticMedia !== CHART_TTS_SYNTHETIC_MEDIA) {
    fail("G7", `containsSyntheticMedia is ${video.containsSyntheticMedia}; the board ruled ${CHART_TTS_SYNTHETIC_MEDIA} for chart + synthetic-narration videos`);
  }
  const desc = normLicence(video.description);
  if (!desc.includes(normLicence(SYNTHETIC_VOICE_DISCLOSURE))) fail("G7", "the description does not carry the synthetic-voice disclosure sentence verbatim");
  if (!ALLOWED_NARRATION_ENGINES.has(video.narration.engine)) {
    fail("G7", `narration engine "${video.narration.engine}" is not one whose voices imitate nobody; such a video is never made`);
  }
  // P-1 — the voice itself, its archive and its model: an engine with a licence record, one of its official voices from
  // the pinned files, and never a name the ruling refuses, whatever the engine string says.
  for (const reason of narrationLicenceFailures(video.narration)) fail("G7", reason);
  for (const d of video.datasets) {
    if (!desc.includes(normLicence(d.name)) || (d.licence && !desc.includes(normLicence(d.licence)))) {
      fail("G7", `the description does not attribute ${d.name} with its licence ${d.licence ?? ""}`.trim());
    }
    if (d.licence && IGO_LICENCES.has(d.licence)) {
      // C2 — §4(a) the licence URI travels with every copy; §3(b) changes made are identified.
      if (!desc.includes(normLicence(CC_BY_3_0_IGO_URI))) fail("G7", `${d.name}: the description lacks the licence URI ${CC_BY_3_0_IGO_URI}`);
      if (!CHANGES_MADE.test(video.description)) fail("G7", `${d.name}: the description does not say the figures were computed/derived from the data (§3(b))`);
      // C3 — §4(b): no implied connection, sponsorship or endorsement.
      if (d.licensor && !desc.includes(normLicence(igoNoEndorsementSentence(d.licensor)))) {
        fail("G7", `${d.name}: the description lacks the sentence "${igoNoEndorsementSentence(d.licensor)}"`);
      }
      // C4 — the credit is for attribution only: the licensor is named in the description, never headlined.
      const titleHit =
        (d.licensor && video.title.toLowerCase().includes(d.licensor.toLowerCase())) || IGO_SHORT_NAMES.test(video.title) || /\bunited nations\b/i.test(video.title);
      if (titleHit) fail("G7", `${d.name}: the title names the licensor; attribution belongs in the description (§4(b))`);
    }
  }
  // G7-k — the kids line only: the declaration to the child (spoken first, a tag in every frame) and to the parent (the
  // description's opening), the English voices, and none of the framings §2 rule 2 excludes (ruling 4.10 §4, §5, §2).
  if (video.line === "kids-explainers") for (const reason of kidsLineFailures(video)) fail("G7", reason);

  // G9 — per-video spend caps, the same numbers the line's experiment gates use.
  const known = Object.hasOwn(EXPERIMENT_BY_LINE, video.line);
  const capsOf = known ? EXPERIMENT_BY_LINE[video.line] : FACELESS_YOUTUBE_EXPERIMENT;
  const caps = capsOf.gates;
  if (video.runnerMinutes > caps.maxRunnerMinutesPerVideo) {
    fail("G9", `${video.runnerMinutes} runner-minutes > ${caps.maxRunnerMinutesPerVideo} (${capsOf.id} caps)`);
  }
  if (video.tokenCostIls > caps.maxTokenCostIlsPerVideo) {
    fail("G9", `₪${video.tokenCostIls} of tokens > ₪${caps.maxTokenCostIlsPerVideo} (${capsOf.id} caps)`);
  }

  // G11 — the audience designation (ruling 4.10 §6 rule 1): the kids line declares made for kids on every upload, T1's
  // line never does, and an undecided value fails on both. The publisher sends `selfDeclaredMadeForKids` equal to it.
  if (!known) {
    fail("G11", `line "${String(video.line)}" is not a YouTube line this gate knows (${Object.keys(EXPERIMENT_BY_LINE).join(", ")})`);
  } else {
    const want = EXPERIMENT_BY_LINE[video.line].declaresMadeForKids;
    if (video.madeForKids === null) fail("G11", `madeForKids was never decided; the ${video.line} line declares ${want} on every upload`);
    else if (video.madeForKids !== want) {
      fail("G11", `madeForKids is ${video.madeForKids}; the ${video.line} line declares ${want} on every upload (ruling 4.10 §6 rule 1)`);
    }
  }

  return { pass: failures.length === 0, failures };
}
