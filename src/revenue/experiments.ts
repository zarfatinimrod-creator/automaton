/**
 * Revenue Colony — pre-registered measurement experiments.
 *
 * Some lines cannot be judged by the revenue floor while they are still finding out whether strangers can reach
 * them at all. The faceless-YouTube experiment (research/faceless-youtube/VERDICT.md, REOPEN_AS_EXPERIMENT,
 * 27.9.2026) is the first: nothing it does can reach the ledger before YouTube's own thresholds, a review and a
 * payment cycle, so `decideLine`'s revenue floor (a fixed ₪500 after 45 days when this was written; since 28.9.2026 a
 * fraction of the line's own target after 90 days) would kill it for a reason that says nothing. Such a line
 * sits in status `measuring`. `decideLine` holds it, and this module judges it by gates written down before the
 * first upload.
 *
 * Pure functions, same as rules.ts: the caller supplies the readings (the Analytics reader, the publication gate,
 * the T1 protocol), this module never fetches anything, and an auditor can re-derive every verdict from the same
 * numbers.
 */

export type ExperimentDecision = "continue" | "extend" | "escalate" | "kill";

/** Everything the gates read. `null` means "not measured yet". */
export interface ExperimentReadings {
  /** Days since the experiment started (the first gate-passing video, or T1 for the T1 gate). */
  day: number;
  /** T1: one honest test video through the audited publisher stayed public for 72 h. null = not run yet. */
  t1Passed: boolean | null;
  /** Videos that passed the publication gate (licence snapshot, fact-check, no-advice check). */
  videosPassedGate: number;
  /** Median stranger (UNSUBSCRIBED; Search + Suggested + Browse) views per video, under the pinned view definition. */
  medianStrangerViews: number | null;
  /** Stranger (UNSUBSCRIBED) watch hours over the trailing 28 days. */
  strangerWatchHours28d: number | null;
  /** Average view percentage on Search traffic — a diagnostic, never a kill. */
  averageViewPercentage: number | null;
  /** Any warning, strike, auto-privating, or YPP rejection citing inauthentic, reused or spam content. */
  policySignal: boolean;
  /** A recurring cost the owner has not explicitly granted. */
  ungrantedRecurringCost: boolean;
  /**
   * P-2: videos on the channel whose audience YouTube set to "made for kids" over our declaration ("you may see your
   * video set as “Set to Made for Kids"", research/rendered/yk2-yt-9527654.txt:93), counted when YouTube sets them,
   * whatever the one appeal later decides. null = unread.
   *
   * NO READER EXISTS. Nothing in this repository reads `status.madeForKids` yet: the read-back after each upload
   * (research/youtube-kids/ASSESSMENT.md §9.2 item 2, the unbuilt G11) is the planned source, through a Data API key on
   * the brand account (Stage A), and Upload-Post's quoted response carries no audience field
   * (research/faceless-youtube/T1-PRECHECK.md:50). Until a reader exists every caller passes null. Before the first upload
   * that is only a note; from T1 or the first gate-passing video on, a null count escalates as K-mfk-unmeasured.
   */
  madeForKidsOverrides: number | null;
  maxRunnerMinutesPerVideo: number | null;
  maxTokenCostIlsPerVideo: number | null;
}

export interface ExperimentGates {
  /** Supply: this many gate-passing videos by this day, or kill. */
  supplyVideos: number;
  supplyByDay: number;
  /** K0: at this day, a median below this many stranger views kills. Passing it carries no information. */
  k0Day: number;
  k0MinMedianStrangerViews: number;
  /** Diagnostic written before the first upload, so the day-56 read can tell "not shown" from "shown and left". */
  diagnosticMinAverageViewPercentage: number;
  /** K3: at this day, stranger watch hours per 28 days. Below `k3KillBelow` kill; at or above `k3EscalateAtOrAbove`
   *  the board decides stage B; between them one extension, re-read at `k3ExtensionDay`. */
  k3Day: number;
  k3KillBelow: number;
  k3EscalateAtOrAbove: number;
  k3ExtensionDay: number;
  /** Per-video spend above which the next upload waits for a fix. */
  maxRunnerMinutesPerVideo: number;
  maxTokenCostIlsPerVideo: number;
}

export interface ExperimentSpec {
  id: string;
  /** Where every number below comes from. */
  sources: string[];
  gates: ExperimentGates;
}

export interface ExperimentVerdict {
  decision: ExperimentDecision;
  /** Gate ids that fired. */
  triggered: string[];
  /** Readable reasons and diagnostics, in the order they were checked. */
  notes: string[];
}

/**
 * The faceless-YouTube experiment. The judge's gates (VERDICT §10) with the red team's binding amendments
 * (RED-TEAM §2.3-§2.4):
 *
 * - K3 kill line 307 h/28 d (50% of the 614 h/28 d pace of the 8,000-hour gate; 614 = 8,000 × 28 ÷ 365), not 61.
 * - K3 stage-B line 1,200 h/28 d — the pace whose implied revenue clears the ₪500 kill floor at the reel's own $7
 *   RPM placeholder (₪500 ÷ 3.7 ÷ $7 × 1,000 ≈ 19,300 views × 4-6 min ≈ 1,200-1,800 h/28 d). The verdict's 614
 *   earns ₪130-250/month, below the floor, and would have bought the owner's identity steps for a line the
 *   colony's own rules kill.
 * - K0's 35-view median is a floor with no information in a pass, and average view percentage is recorded beside it.
 *
 * The pinned view definition (first-frame vs engaged) must be recorded before the first upload; the gate reads
 * whatever the Analytics API returns under it.
 */
export const FACELESS_YOUTUBE_EXPERIMENT: ExperimentSpec = {
  id: "faceless-youtube",
  sources: [
    "research/faceless-youtube/VERDICT.md §10 (judge, Fable, 27.9.2026)",
    "research/faceless-youtube/RED-TEAM.md §2.3, §2.4, §2.5 (red team, Fable, 27.9.2026) — binding amendments",
  ],
  gates: {
    supplyVideos: 6,
    supplyByDay: 42,
    k0Day: 56,
    k0MinMedianStrangerViews: 35,
    diagnosticMinAverageViewPercentage: 30,
    k3Day: 112,
    k3KillBelow: 307,
    k3EscalateAtOrAbove: 1200,
    k3ExtensionDay: 196,
    maxRunnerMinutesPerVideo: 60,
    maxTokenCostIlsPerVideo: 20,
  },
};

/**
 * P-2, pre-registered 30.9.2026 (research/channel-loop/RULING-2026-09-30-video.md 16(c) item 7; research/youtube-kids/
 * ASSESSMENT.md §9.2 item 2, :421-422): YouTube setting a video on T1's channel to "made for kids" over our declaration.
 * The first override flags the board; the video goes private, gets its one appeal ("You may appeal each video only
 * once.", research/rendered/yk2-yt-9527654.txt:333) and is never relabelled or re-uploaded. `killAt` overrides kill the
 * YouTube line. Kept apart from FACELESS_YOUTUBE_EXPERIMENT.gates, which are pinned as the 27.9 pre-registration and stay
 * byte-identical; this criterion carries its own date and its own pin (t1-made-for-kids-kill.test.ts).
 */
export const MADE_FOR_KIDS_OVERRIDES = { killAt: 2 } as const;

/**
 * The web comparison arm's reach floor (research/faceless-youtube/PREREG-DECISIONS.md §3, board 28.9.2026), read at
 * day 56 from the arm's own D0 (public deploy + recorded discovery submission). Kept apart from the experiment's gates:
 * the arm has its own clock, and its verdict is procedural — whether Stage A may be put to the owner (T1-PROTOCOL order
 * item 6) — not a channel gate. `engagedStrangerViews` is the count of $pageview events at the canonical URL, sent on
 * first scroll, own paths and preview hosts excluded, payload shape ours; null = the project could not be read.
 */
export const WEB_ARM_REACH = { day: 56, minEngagedStrangerViews: 5 } as const;

export interface WebArmReading {
  day: number;
  engagedStrangerViews: number | null;
}

export type WebArmVerdict = "not_due" | "unmeasured" | "stage_a_never_asked" | "stage_a_may_be_asked";

export function evaluateWebArm(r: WebArmReading, g: typeof WEB_ARM_REACH = WEB_ARM_REACH): WebArmVerdict {
  if (r.day < g.day) return "not_due";
  if (r.engagedStrangerViews === null) return "unmeasured";
  return r.engagedStrangerViews < g.minEngagedStrangerViews ? "stage_a_never_asked" : "stage_a_may_be_asked";
}

/**
 * Judge an experiment on one set of readings. A kill outranks an escalation, which outranks an extension.
 * An unmeasured gate that is due counts as failed: an experiment nobody can read is not an experiment
 * (MISSION rule 5).
 */
export function evaluateExperiment(spec: ExperimentSpec, r: ExperimentReadings): ExperimentVerdict {
  const g = spec.gates;
  const kills: string[] = [];
  const escalations: string[] = [];
  const notes: string[] = [];
  let extend = false;

  if (r.t1Passed === false) {
    kills.push("K-T1");
    notes.push("T1 failed: no owner-free public upload route — stays rejected unless the owner explicitly opts into a paid tier or per-batch confirmation");
  }
  if (r.policySignal) {
    kills.push("K-policy");
    notes.push("a policy signal (warning, strike, auto-privating or an inauthentic/reused/spam rejection) — kill; never a workaround channel");
  }
  if (r.ungrantedRecurringCost) {
    kills.push("K-cash");
    notes.push("a recurring cost the owner has not granted");
  }
  // P-2 (MADE_FOR_KIDS_OVERRIDES): a YouTube-set made-for-kids override flags the board; the second kills. The count is
  // due from the first upload (ASSESSMENT §9.2 item 2: a read-back after each upload). T1 is the first upload, and a
  // gate-passing video is one cleared to go up, so either makes an unread count a due gate with no reading.
  const mfkKillAt = MADE_FOR_KIDS_OVERRIDES.killAt;
  if (r.madeForKidsOverrides === null) {
    const uploadDue = r.t1Passed !== null || r.videosPassedGate > 0;
    if (uploadDue) {
      // Counted as failed (the rule above) at the first override's level: the board is flagged, and whether an unread
      // count should kill instead is the board's call (logs/2026-09-30-p1-p3-in-code.md), not this function's.
      escalations.push("K-mfk-unmeasured");
      notes.push("K-mfk is due from the first upload and has no reading: nothing reads status.madeForKids yet (the read-back of ASSESSMENT §9.2 item 2 is unbuilt), so an override would go unseen — an unmeasured gate that is due counts as failed; the board is flagged");
    } else {
      notes.push("K-mfk has no reader: nothing reads status.madeForKids yet (the read-back of ASSESSMENT §9.2 item 2 is unbuilt); not due before the first upload");
    }
  } else if (r.madeForKidsOverrides >= mfkKillAt) {
    kills.push("K-mfk");
    notes.push(`${r.madeForKidsOverrides} made-for-kids overrides by YouTube on this channel (kill at ${mfkKillAt}): the YouTube line is killed — never a replacement channel`);
  } else if (r.madeForKidsOverrides > 0) {
    escalations.push("K-mfk-override");
    notes.push("YouTube set a video to made for kids over our declaration: it goes private, gets one appeal, and is never relabelled or re-uploaded; the board is flagged, and a second override kills the line");
  }
  if (r.day >= g.supplyByDay && r.videosPassedGate < g.supplyVideos) {
    kills.push("K-supply");
    notes.push(`only ${r.videosPassedGate} of ${g.supplyVideos} videos passed the publication gate by day ${g.supplyByDay}`);
  }

  if (r.day >= g.k0Day && r.day < g.k3Day) {
    if (r.medianStrangerViews === null) {
      kills.push("K0-unmeasured");
      notes.push(`K0 is due at day ${g.k0Day} and there is no reading`);
    } else if (r.medianStrangerViews < g.k0MinMedianStrangerViews) {
      kills.push("K0");
      notes.push(`median stranger views ${r.medianStrangerViews} < ${g.k0MinMedianStrangerViews} at day ${r.day}`);
    } else {
      notes.push(`K0 passed with a median of ${r.medianStrangerViews} — a no-information pass: a curated explainer beats a random upload by construction`);
    }
    if (r.averageViewPercentage !== null && r.averageViewPercentage < g.diagnosticMinAverageViewPercentage) {
      notes.push(`diagnostic: average view percentage ${r.averageViewPercentage}% is under the pre-registered ${g.diagnosticMinAverageViewPercentage}% — shown and abandoned, not unshown`);
    }
  }

  if (r.day >= g.k3Day) {
    const h = r.strangerWatchHours28d;
    const extensionRead = r.day >= g.k3ExtensionDay;
    if (h === null) {
      kills.push("K3-unmeasured");
      notes.push(`K3 is due at day ${g.k3Day} and there is no reading`);
    } else if (h >= g.k3EscalateAtOrAbove) {
      escalations.push("K3-stage-B");
      notes.push(`stranger watch hours ${h}/28 d ≥ ${g.k3EscalateAtOrAbove}: the board decides stage B (AdSense, tax forms) — nothing is asked of the owner before it does`);
    } else if (extensionRead || h < g.k3KillBelow) {
      kills.push("K3");
      notes.push(extensionRead
        ? `day-${g.k3ExtensionDay} re-read: ${h} h/28 d is still under ${g.k3EscalateAtOrAbove} — there is no second extension`
        : `stranger watch hours ${h}/28 d < ${g.k3KillBelow} at day ${r.day}`);
    } else {
      extend = true;
      notes.push(`stranger watch hours ${h}/28 d is between ${g.k3KillBelow} and ${g.k3EscalateAtOrAbove}: one extension of six more videos, with a written board rationale, re-read at day ${g.k3ExtensionDay}`);
    }
  }

  if (r.maxRunnerMinutesPerVideo !== null && r.maxRunnerMinutesPerVideo > g.maxRunnerMinutesPerVideo) {
    escalations.push("K-compute");
    notes.push(`${r.maxRunnerMinutesPerVideo} runner-minutes per video > ${g.maxRunnerMinutesPerVideo}: pause the next upload and fix`);
  }
  if (r.maxTokenCostIlsPerVideo !== null && r.maxTokenCostIlsPerVideo > g.maxTokenCostIlsPerVideo) {
    escalations.push("K-compute");
    notes.push(`₪${r.maxTokenCostIlsPerVideo} of tokens per video > ₪${g.maxTokenCostIlsPerVideo}: pause the next upload and fix`);
  }

  const triggered = [...new Set([...kills, ...escalations])];
  if (kills.length) return { decision: "kill", triggered, notes };
  if (escalations.length) return { decision: "escalate", triggered, notes };
  if (extend) return { decision: "extend", triggered: ["K3-extension"], notes };
  return { decision: "continue", triggered: [], notes };
}
