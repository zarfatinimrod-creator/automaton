/**
 * Revenue Colony — the publication gate for the faceless-YouTube experiment (VERDICT §12, G1-G10).
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

import { FACELESS_YOUTUBE_EXPERIMENT } from "./experiments.js";

export type GateId = "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7" | "G8" | "G9" | "G10";
export type ChannelAction = "publish" | "privatize" | "delete";

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
  title: string;
  description: string;
  topic: string;
  /** The narration, exactly as it will be spoken. */
  script: string;
  datasets: DatasetUse[];
  originality: AuditVerdict | null;
  factCheck: (AuditVerdict & { figuresChecked: number }) | null;
  promiseMatch: AuditVerdict | null;
  /** YouTube's altered-or-synthetic flag: must be decided, and for this video class the board ruled `true` (G7). */
  containsSyntheticMedia: boolean | null;
  /** What speaks. Only an engine in ALLOWED_NARRATION_ENGINES passes; a voice imitating a real person is never made (§2c). */
  narration: { engine: string; voiceId: string };
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
 * Narration engines whose stock voices are nobody's (PREREG-DECISIONS.md §2c). Kokoro's training excluded "custom voice
 * clones" (kokoro-82m-model-card.txt:237). A cloning engine, or a voice that imitates an identifiable person, cannot pass
 * this gate with or without the flag: such a video is never made.
 */
export const ALLOWED_NARRATION_ENGINES: ReadonlySet<string> = new Set(["kokoro-82m"]);

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

  // G9 — per-video spend caps, the same numbers the experiment's gates use.
  const caps = FACELESS_YOUTUBE_EXPERIMENT.gates;
  if (video.runnerMinutes > caps.maxRunnerMinutesPerVideo) {
    fail("G9", `${video.runnerMinutes} runner-minutes > ${caps.maxRunnerMinutesPerVideo}`);
  }
  if (video.tokenCostIls > caps.maxTokenCostIlsPerVideo) {
    fail("G9", `₪${video.tokenCostIls} of tokens > ₪${caps.maxTokenCostIlsPerVideo}`);
  }

  return { pass: failures.length === 0, failures };
}
