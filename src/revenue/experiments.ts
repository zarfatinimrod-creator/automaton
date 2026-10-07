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
  /**
   * The first-upload window: one honest test video through the audited publisher stayed public for 72 h. T1 for
   * faceless-youtube (K-T1); the kids channel's own window for kids-explainers (K-T1k, ruling 4.10 §8 rule 3). null = not
   * run yet. A non-null value means at least one upload exists.
   *
   * It is `firstUploadWindow(entry, publisherAccepted, p3, p4).passed` (src/revenue/youtube-madeforkids.ts), never a
   * typed-in boolean: P1's API half and P2 from the read-back's entry for the first upload, P1's publisher half, P3 and
   * P4 as recorded (research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md §4 decision 3).
   */
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
   * The designation read-back (ruling 4.10 §6 rule 2): `status.madeForKids` of every uploaded video, in upload order — one
   * entry per upload, "true", "false", or null for an upload with no reading yet. It is src/revenue/youtube-madeforkids.ts
   * `readbackOf(state, uploads)`: the reader re-reads every upload on every run, and an entry is the designation the line
   * does NOT declare once any read has carried it (that read is kept whatever later reads or the one appeal say), else the
   * declared one, else null.
   *
   * On a channel that declares made for kids, "false" kills (K-mfk-designation). On one that declares not made for kids
   * (today T1), "true" is YouTube's override ("you may see your video set as “Set to Made for Kids"",
   * research/rendered/yk2-yt-9527654.txt:93), and P-2's count is the number of "true" entries — counted when YouTube sets
   * them, whatever the one appeal later decides (ruling 4.10 §8 rule 4). There is no other override input: since 4.10 the
   * count is derived from this list, never typed in beside it.
   *
   * THE READ IS A PRECONDITION OF UPLOADING (ruling 4.10 §10 rule 1): `videos.list`, `part=status`, with a Data API key
   * from Stage A (scripts/youtube-madeforkids-readback.ts), fixture-tested and never run live before Stage A; Upload-Post's
   * quoted response carries no audience field (research/faceless-youtube/T1-PRECHECK.md:50). Before the first upload the
   * list is empty and nothing is due — a video that passed the gate but is not uploaded has nothing to read. A null is an
   * upload that exists and is unread: an instrument fault (KILL-1) that escalates and freezes the next upload
   * (K-mfk-unmeasured, §10 rule 2), and kills as K0-unmeasured from the K0 day on (§10 rule 3: "measured" at K0 includes
   * the designation read of every upload).
   */
  madeForKidsReadback: ("true" | "false" | null)[];
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
  /**
   * The audience every upload of the line declares (`selfDeclaredMadeForKids`; G11 in publication-gate.ts): false for
   * T1, true for kids-explainers. Decides which way the designation read-back is judged.
   */
  declaresMadeForKids: boolean;
  /** The kill id of the first-upload window: T1's "K-T1", the kids channel's "K-T1k" (ruling 4.10 §8 rule 3). */
  firstUploadKill: "K-T1" | "K-T1k";
}

export interface ExperimentVerdict {
  decision: ExperimentDecision;
  /** Gate ids that fired. */
  triggered: string[];
  /** Readable reasons and diagnostics, in the order they were checked. */
  notes: string[];
  /**
   * The next upload on this channel must wait: any kill; K-mfk-unmeasured (an upload that exists and has no designation
   * reading: "it also blocks the next upload on that channel until the reading exists", ruling 4.10 §10 rule 2); or
   * K-compute ("pause the next upload and fix"). The publisher MUST read it before every upload. No publisher exists yet;
   * none may be built that does not call publisher-guard.ts `assertMayUpload` first, which refuses while this is true
   * (publisher-guard.test.ts fails on any code in the colony that can upload without calling it).
   */
  uploadsFrozen: boolean;
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
  declaresMadeForKids: false,
  firstUploadKill: "K-T1",
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
 * The kids-explainers experiment, admitted 4.10.2026 (research/channel-loop/RULING-2026-10-04-kids-youtube.md §11):
 * English, declared made for kids, for children who can read; one question from one of T1's cleared datasets, charts drawn
 * by code, Kokoro narration from the English voices; no revenue target (§6 rule 5), held by protocol behind T1 (§8 rule 2).
 *
 * Its kills (§8 rule 3), with T1's numbers on the kids channel's own D0. The gates below are a copy of
 * FACELESS_YOUTUBE_EXPERIMENT.gates written out, so a later board change to T1's numbers does not move this line's:
 *   - K-mfk-designation (KILL-4): any upload reads back `madeForKids = false` — kill; never a Studio click, never a
 *     relabel (§6 rule 2). The ruling's other two triggers (the publisher cannot send `selfDeclaredMadeForKids`; the
 *     channel-level setting cannot be made in the Stage A sitting) are protocol events, not readings this module sees.
 *   - K-policy (KILL-3), K-T1k (the kids channel's own first-upload window: P1-P4 as T1's, read through the publisher's
 *     response and `videos.list part=status`, never the watch page), K-supply, K0, K3, K-cash, K-compute.
 *   - K-mfk-read (§10): an unread designation escalates and freezes the next upload; from the K0 day it kills
 *     (K0-unmeasured).
 *   - No K-web: the line has no web arm (§8 rule 1). The `youtubeProduct = KIDS` split is a diagnostic, never a kill,
 *     and is not coded until a github-grade source for the dimension is read ("Not ruled here" 5).
 * Pinned under its own hash (kids-explainers-kills.test.ts), never T1's PINNED_GATES_SHA256.
 */
export const KIDS_EXPLAINERS_EXPERIMENT: ExperimentSpec = {
  id: "kids-explainers",
  sources: [
    "research/channel-loop/RULING-2026-10-04-kids-youtube.md §8 rule 3 (kills), §10 (the designation read), §6 rule 2 (read-back) — Fable, 4.10.2026",
    "research/faceless-youtube/VERDICT.md §10 as amended by RED-TEAM.md §2.3-§2.5 — T1's numbers, which §8 rule 3 adopts",
  ],
  declaresMadeForKids: true,
  firstUploadKill: "K-T1k",
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
 * ASSESSMENT.md §9.2 item 2, :421-422), in the wording research/channel-loop/RULING-2026-10-04-kids-youtube.md §8 rule 4
 * unified: a YouTube-set made-for-kids override on a video of a channel that declares not made for kids (today T1). The
 * first override → private plus one appeal ("You may appeal each video only once.", research/rendered/yk2-yt-9527654.txt
 * :333), never relabelled or re-uploaded, and the board is flagged; the `killAt`-th kills that channel's line — the
 * channel's line, not both YouTube lines. On the kids channel, which declares made for kids, the mirror-image event is
 * K-mfk-designation (KIDS_EXPLAINERS_EXPERIMENT). Kept apart from FACELESS_YOUTUBE_EXPERIMENT.gates, which are pinned as
 * the 27.9 pre-registration and stay byte-identical; this criterion carries its own date and its own pin
 * (t1-made-for-kids-kill.test.ts).
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
    kills.push(spec.firstUploadKill);
    notes.push(
      spec.firstUploadKill === "K-T1k"
        ? "K-T1k: the kids channel's first-upload window failed (P1-P4 as T1's, read through the publisher's response and videos.list part=status, never a fetch of the watch page) — kill"
        : "T1 failed: no owner-free public upload route — stays rejected unless the owner explicitly opts into a paid tier or per-batch confirmation",
    );
  }
  if (r.policySignal) {
    kills.push("K-policy");
    notes.push("a policy signal (warning, strike, auto-privating or an inauthentic/reused/spam rejection) — kill; never a workaround channel");
  }
  if (r.ungrantedRecurringCost) {
    kills.push("K-cash");
    notes.push("a recurring cost the owner has not granted");
  }
  // The designation read-back (ruling 4.10 §6 rule 2): one entry per upload. A first-upload window that has been judged
  // means an upload exists, so an empty read-back then is an unread upload, not a clean one. An empty read-back otherwise
  // means nothing is uploaded: nothing to read, nothing due, nothing frozen (§10 rule 1 makes the reader, built and
  // tested, the precondition before the first upload).
  const readback: ("true" | "false" | null)[] =
    r.madeForKidsReadback.length === 0 && r.t1Passed !== null ? [null] : r.madeForKidsReadback;
  const unread = readback.flatMap((v, i) => (v === null ? [i + 1] : []));
  const of = (i: number) => `upload ${i} of ${readback.length}`;
  if (spec.declaresMadeForKids) {
    // K-mfk-designation (KILL-4): `false` means the machine route did not carry our designation; the only remedy would be
    // a Studio click per upload, a per-item owner action.
    const readFalse = readback.flatMap((v, i) => (v === "false" ? [i + 1] : []));
    if (readFalse.length) {
      kills.push("K-mfk-designation");
      notes.push(`${readFalse.map(of).join(", ")} read back madeForKids = false on a channel that declares made for kids: the line is killed (K-mfk-designation) — never a Studio click, never relabelled, never re-uploaded`);
    }
    notes.push("P-2 does not apply: this channel declares made for kids, so YouTube cannot set it to made for kids over our declaration; the mirror-image event is K-mfk-designation");
  } else {
    // P-2 (MADE_FOR_KIDS_OVERRIDES): a YouTube-set made-for-kids override flags the board; the second kills that channel's
    // line. The count is due from the first upload (ASSESSMENT §9.2 item 2: a read-back after each upload), and it is the
    // read-back's `true` entries: an unread upload is flagged below (K-mfk-unmeasured), never counted as a zero.
    const mfkKillAt = MADE_FOR_KIDS_OVERRIDES.killAt;
    if (readback.length === 0) {
      notes.push("K-mfk has no reading: the read-back runs after each upload (src/revenue/youtube-madeforkids.ts); not due before the first upload");
    } else if (unread.length) {
      notes.push(`K-mfk is due from the first upload and has no reading for ${unread.map(of).join(", ")}: an override there would go unseen (status.madeForKids) — an unmeasured gate that is due counts as failed, and the board is flagged`);
    }
    const overrides = readback.filter((v) => v === "true").length;
    if (overrides >= mfkKillAt) {
      kills.push("K-mfk");
      notes.push(`${overrides} made-for-kids overrides by YouTube on this channel (kill at ${mfkKillAt}): this channel's line is killed, not both YouTube lines — never a replacement channel`);
    } else if (overrides > 0) {
      escalations.push("K-mfk-override");
      notes.push("YouTube set a video to made for kids over our declaration: it goes private, gets one appeal, and is never relabelled or re-uploaded; the board is flagged, and a second override kills the line");
    }
  }
  if (unread.length) {
    escalations.push("K-mfk-unmeasured");
    notes.push(`${unread.map(of).join(", ")} has no designation reading (status.madeForKids): an instrument fault under KILL-1 — no upload on this channel until the reading exists; the board is flagged (ruling 4.10 §10 rule 2)`);
    if (r.day >= g.k0Day) {
      kills.push("K0-unmeasured");
      notes.push(`K0 is due at day ${g.k0Day} and the designation of ${unread.map(of).join(", ")} is still unread: K0 is unmeasured (ruling 4.10 §10 rule 3)`);
    }
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
  const uploadsFrozen = kills.length > 0 || escalations.some((e) => FREEZING_ESCALATIONS.has(e));
  if (kills.length) return { decision: "kill", triggered, notes, uploadsFrozen };
  if (escalations.length) return { decision: "escalate", triggered, notes, uploadsFrozen };
  if (extend) return { decision: "extend", triggered: ["K3-extension"], notes, uploadsFrozen };
  return { decision: "continue", triggered: [], notes, uploadsFrozen };
}

/** Escalations that hold the next upload (ExperimentVerdict.uploadsFrozen): an unread upload, and a spend overrun. */
const FREEZING_ESCALATIONS: ReadonlySet<string> = new Set(["K-mfk-unmeasured", "K-compute"]);
