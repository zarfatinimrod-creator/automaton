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
  /** YouTube's altered-or-synthetic flag: must be decided (true/false), never left unset. */
  containsSyntheticMedia: boolean | null;
  scheduledAt: string;
  runnerMinutes: number;
  tokenCostIls: number;
}

export interface ChannelState {
  published: { id: string; publishedAt: string; script: string }[];
  yppReviewPending: boolean;
  dmcaCounterNoticeFiled: boolean;
}

export interface GateFailure {
  gate: GateId;
  reason: string;
}

export interface GateResult {
  pass: boolean;
  failures: GateFailure[];
}

/** Licences a narrated chart video can carry with attribution alone. ShareAlike and NonCommercial are out. */
export const ALLOWED_DATA_LICENCES: ReadonlySet<string> = new Set(["CC0-1.0", "CC-BY-4.0", "CC-BY-3.0", "public-domain"]);

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

  // G7 — the synthetic-media flag decided, and every dataset attributed with its licence in the description.
  if (video.containsSyntheticMedia === null) fail("G7", "containsSyntheticMedia was never decided");
  const desc = normLicence(video.description);
  for (const d of video.datasets) {
    if (!desc.includes(normLicence(d.name)) || (d.licence && !desc.includes(normLicence(d.licence)))) {
      fail("G7", `the description does not attribute ${d.name} with its licence ${d.licence ?? ""}`.trim());
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
