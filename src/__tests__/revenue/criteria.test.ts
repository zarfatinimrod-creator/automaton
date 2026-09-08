import { renderSweepWorkflow } from "../../revenue/sweep-workflow.js";
import { describe, it, expect } from "vitest";
import {
  ALL_CRITERIA,
  CRITERIA_GROUPS,
  SCOUT_REPORT_DIR,
  criteriaFromReportFilenames,
  scoutReportFilename,
  SWEEP_INTERVAL_DAYS,
  criteriaDueForSweep,
  criterionById,
  groupById,
  scoutRoleFor,
  sweepAuditorRoleFor,
  sweepGoalSpec,
  sweepSupervisorRoleFor,
} from "../../revenue/criteria.js";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("criteria registry", () => {
  it("carries at least the hundred scouts the owner asked for", () => {
    expect(ALL_CRITERIA.length).toBeGreaterThanOrEqual(100);
    expect(CRITERIA_GROUPS.length).toBeGreaterThanOrEqual(10);
  });

  it("gives every group a supervisor-sized span of control", () => {
    for (const g of CRITERIA_GROUPS) {
      expect(g.criteria.length).toBeGreaterThanOrEqual(4);
      expect(g.criteria.length).toBeLessThanOrEqual(12);
    }
  });

  it("has unique ids across the whole registry", () => {
    const ids = ALL_CRITERIA.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const groupIds = CRITERIA_GROUPS.map((g) => g.id);
    expect(new Set(groupIds).size).toBe(groupIds.length);
  });

  it("namespaces every criterion under its group", () => {
    for (const c of ALL_CRITERIA) {
      expect(c.id.startsWith(`${c.groupId}/`)).toBe(true);
      expect(groupById(c.groupId)?.id).toBe(c.groupId);
    }
  });

  it("gives every criterion a brief a scout can act on without further context", () => {
    for (const c of ALL_CRITERIA) {
      // Short briefs are the failure mode: a scout with a two-word topic invents.
      expect(c.brief.length).toBeGreaterThan(60);
    }
  });

  it("looks criteria up by id", () => {
    expect(criterionById(ALL_CRITERIA[0].id)?.brief).toBe(ALL_CRITERIA[0].brief);
    expect(criterionById("no/such")).toBeUndefined();
    expect(groupById("no-such")).toBeUndefined();
  });

  it("keeps the Israeli bureaucracy and payment-rail groups, which gate everything else", () => {
    expect(groupById("israel-bureaucracy")).toBeDefined();
    expect(groupById("payment-rails")).toBeDefined();
  });
});

describe("criteriaDueForSweep", () => {
  const now = Date.parse("2026-09-03T00:00:00.000Z");

  it("treats a never-swept criterion as due", () => {
    expect(criteriaDueForSweep(new Map(), now)).toHaveLength(ALL_CRITERIA.length);
  });

  it("skips one swept inside the interval and returns one swept outside it", () => {
    const fresh = new Date(now - 3 * DAY_MS).toISOString();
    const stale = new Date(now - (SWEEP_INTERVAL_DAYS + 2) * DAY_MS).toISOString();
    const map = new Map(ALL_CRITERIA.map((c) => [c.id, fresh]));
    expect(criteriaDueForSweep(map, now)).toHaveLength(0);

    map.set(ALL_CRITERIA[5].id, stale);
    const due = criteriaDueForSweep(map, now);
    expect(due).toHaveLength(1);
    expect(due[0].id).toBe(ALL_CRITERIA[5].id);
  });

  it("re-sweeps rather than trusting an unparseable timestamp", () => {
    const map = new Map(ALL_CRITERIA.map((c) => [c.id, "not a date"]));
    expect(criteriaDueForSweep(map, now)).toHaveLength(ALL_CRITERIA.length);
  });

  it("honours a caller-supplied interval", () => {
    const map = new Map(ALL_CRITERIA.map((c) => [c.id, new Date(now - 10 * DAY_MS).toISOString()]));
    expect(criteriaDueForSweep(map, now, 7)).toHaveLength(ALL_CRITERIA.length);
    expect(criteriaDueForSweep(map, now, 14)).toHaveLength(0);
  });
});

describe("sweep roles", () => {
  const group = CRITERIA_GROUPS[0];
  const criterion = group.criteria[0];

  it("gives a scout its brief and nothing that could spend money", () => {
    const role = scoutRoleFor(criterion);
    expect(role.systemPrompt).toContain(criterion.brief);
    expect(role.systemPrompt).toContain(group.title);
    expect(role.allowedTools).toContain("web_search");
    expect(role.deniedTools).toContain("transfer_credits");
    expect(role.deniedTools).toContain("revenue_record");
    expect(role.treasuryLimits).toEqual({ maxSingleTransfer: 0, maxDailySpend: 0 });
  });

  it("names every role uniquely, since names address the agents", () => {
    const names = [
      ...ALL_CRITERIA.map((c) => scoutRoleFor(c).name),
      ...CRITERIA_GROUPS.map((g) => sweepSupervisorRoleFor(g).name),
      ...CRITERIA_GROUPS.map((g) => sweepAuditorRoleFor(g).name),
    ];
    expect(new Set(names).size).toBe(names.length);
  });

  it("keeps the supervisor out of the ledger and the auditor out of every record", () => {
    const sup = sweepSupervisorRoleFor(group);
    expect(sup.deniedTools).toContain("revenue_record");
    const aud = sweepAuditorRoleFor(group);
    expect(aud.deniedTools).toContain("revenue_decide");
    expect(aud.systemPrompt).toContain("refute");
  });

  it("files a goal that names every criterion in the group", () => {
    const spec = sweepGoalSpec(group);
    for (const c of group.criteria) expect(spec.description).toContain(c.id);
    expect(spec.title).toContain(group.title);
  });
});

describe("reconciling the registry with the scout reports on disk", () => {
  it("round-trips every criterion id through its report filename", () => {
    const names = ALL_CRITERIA.map((c) => scoutReportFilename(c.id));
    const { known, unknown } = criteriaFromReportFilenames(names);
    expect(unknown).toEqual([]);
    expect(new Set(known)).toEqual(new Set(ALL_CRITERIA.map((c) => c.id)));
  });

  it("reports files that match no criterion instead of dropping them", () => {
    const { known, unknown } = criteriaFromReportFilenames([
      scoutReportFilename(ALL_CRITERIA[0]!.id),
      "storefronts--a-criterion-we-renamed.md",
      "README.md",
    ]);
    expect(known).toEqual([ALL_CRITERIA[0]!.id]);
    // A renamed criterion and a stray file both surface; silently ignoring them
    // is how a registry and its evidence lose touch.
    expect(unknown).toEqual(["storefronts--a-criterion-we-renamed.md", "README.md"]);
  });

  it("ignores non-markdown files without calling them unknown", () => {
    const { known, unknown } = criteriaFromReportFilenames([".gitkeep", "notes.txt"]);
    expect(known).toEqual([]);
    expect(unknown).toEqual([]);
  });

  it("names the directory the sweep workflow actually writes to", () => {
    // The workflow prompt hard-codes this path; if the constant and the prompt
    // drift, reconcile silently finds nothing.
    expect(renderSweepWorkflow()).toContain(SCOUT_REPORT_DIR);
  });
});
