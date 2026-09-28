import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { WEB_ARM_REACH, evaluateWebArm, type WebArmReading } from "../../revenue/experiments.js";

// research/faceless-youtube/PREREG-DECISIONS.md §3.6: the loop writes the web arm's readings here — D0 with its two
// conditions, the discovery routes opened, own-view exceptions, the daily series, the foreign-shaped count, and at
// D0+56 the verdict of evaluateWebArm — "so an auditor re-runs it on the same numbers". This test is that re-run.
const FILE = join("research", "faceless-youtube", "readings", "web-arm.json");

interface WebArmReadings {
  floor: typeof WEB_ARM_REACH;
  canonicalUrl: string | null;
  d0: {
    publicDeploy: { at: string | null; evidence: string | null };
    discoverySubmission: { at: string | null; route: string | null };
    date: string | null;
  };
  routesOpened: { route: string; openedAt: string; detail: string }[];
  ownViewExceptions: { at: string; detail: string }[];
  instrumentFaults: { at: string; detail: string; fixedAt: string | null }[];
  dailyCountedEvents: { date: string; count: number }[];
  foreignShapedEventsExcluded: number | null;
  read: (WebArmReading & { readAt: string; verdict: string }) | null;
}

const readings = (): WebArmReadings => JSON.parse(readFileSync(FILE, "utf8")) as WebArmReadings;

describe("the web arm's readings file (PREREG-DECISIONS.md §3.6)", () => {
  it("carries every field the section lists, under the pre-registered floor", () => {
    const r = readings();
    expect(r.floor).toEqual(WEB_ARM_REACH);
    expect(Object.keys(r.d0).sort()).toEqual(["date", "discoverySubmission", "publicDeploy"]);
    for (const k of ["routesOpened", "ownViewExceptions", "instrumentFaults", "dailyCountedEvents"] as const) {
      expect(Array.isArray(r[k])).toBe(true);
    }
    expect("foreignShapedEventsExcluded" in r && "read" in r && "canonicalUrl" in r).toBe(true);
  });

  it("has no D0 unless both conditions hold: a public deploy and a recorded discovery submission (§3.5)", () => {
    const { d0 } = readings();
    if (d0.date !== null) {
      expect(d0.publicDeploy.at).not.toBeNull();
      expect(d0.discoverySubmission.at).not.toBeNull();
    }
  });

  it("records a verdict that evaluateWebArm gives on the file's own numbers", () => {
    const { read, d0 } = readings();
    if (read === null) return; // nothing read yet: the normal state before D0+56
    expect(d0.date).not.toBeNull();
    expect(read.verdict).toBe(evaluateWebArm({ day: read.day, engagedStrangerViews: read.engagedStrangerViews }));
  });
});
