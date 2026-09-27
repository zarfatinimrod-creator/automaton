import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  OWNER_STEPS,
  frozenOwnerStepsForLine,
  hasPendingPrecondition,
  heldOwnerStepsForLine,
  isOwnerStepOpen,
  linesWithNoOwnerStep,
  openOwnerStepsForLine,
  ownerStepById,
  ownerStepMinutes,
  ownerStepsForLine,
  ownerStepsInOrder,
} from "../../revenue/owner-steps.js";
import { DEFAULT_PORTFOLIO } from "../../revenue/portfolio.js";

const repoRoot = path.resolve(__dirname, "../../..");
const doc = fs.readFileSync(path.join(repoRoot, "docs/OWNER_STEPS.he.md"), "utf-8");

describe("the owner's checklist is seven steps and stays seven", () => {
  it("has exactly seven steps, with stable numbers 1..7", () => {
    // MISSION rule 1: never invent a step. The failure mode is drift, not a bad
    // decision — the chief audit found six catalogue items written out as
    // eleven, because "register as osek patur" was repeated once per line and an
    // accountant conversation had been added by someone reasoning about tax. An
    // eighth step should require a decision, so it fails the build.
    expect(OWNER_STEPS).toHaveLength(7);
    expect(OWNER_STEPS.map((s) => s.number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(new Set(OWNER_STEPS.map((s) => s.id)).size).toBe(7);
  });

  it("runs in the order the board ruled: 1, 2, 3, 5, 7, 4, 6", () => {
    // BOARD.md §5. The numbers stay fixed so an earlier conversation about
    // "step 4" still means the same step; only the order moved.
    expect(ownerStepsInOrder().map((s) => s.number)).toEqual([1, 2, 3, 5, 7, 4, 6]);
    expect(ownerStepsInOrder().map((s) => s.id)).toEqual([
      "merge-pr", "tax-file", "gumroad", "domain", "github-org", "algora-stripe", "ci-tokens",
    ]);
    expect(OWNER_STEPS.map((s) => s.order).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("lets the Apify half of step 6 be done straight after step 1", () => {
    // It is the only early part in the list and it is the reason the list has
    // one at all: the token starts the 30-day stranger count a month earlier
    // than the rest of the checklist would allow, and it needs no identity check.
    const early = OWNER_STEPS.filter((s) => s.earlyPart);
    expect(early.map((s) => s.id)).toEqual(["ci-tokens"]);
    expect(early[0].earlyPart!.afterStep).toBe("merge-pr");
    expect(early[0].earlyPart!.what).toMatch(/APIFY_TOKEN/);
  });

  it("keeps each step to the identity, KYC or payout work a platform actually requires", () => {
    for (const step of OWNER_STEPS) {
      expect(step.unlocks.length, `${step.id} does not say what it unlocks`).toBeGreaterThan(60);
      expect(step.minutes[0]).toBeGreaterThan(0);
      expect(step.minutes[1]).toBeGreaterThanOrEqual(step.minutes[0]);
    }
    // Six of the seven map to a chief-audit catalogue item. The seventh is the
    // PR merge, which is consent rather than identity — and it is correctly
    // absent from that catalogue, so a null here is the honest value.
    const catalogued = OWNER_STEPS.filter((s) => s.catalogueRef !== null);
    expect(catalogued).toHaveLength(6);
    expect(ownerStepById("merge-pr")!.catalogueRef).toBeNull();
    expect(new Set(catalogued.map((s) => s.catalogueRef)).size).toBe(6);
  });

  it("costs about two and a half hours in total", () => {
    const { min, max } = ownerStepMinutes();
    expect(min).toBeGreaterThan(100);
    expect(max).toBeLessThan(200);
  });
});

describe("every line's human setup maps to a step, and every step unlocks a line", () => {
  it("leaves no live line blocked on a step that is not on the list", () => {
    // A line whose blocker is not in the checklist is a line the owner will
    // never unblock, and nobody would notice: the board would park it in
    // awaiting_setup forever and report it as "waiting on the owner".
    expect(linesWithNoOwnerStep()).toEqual([]);
    for (const line of DEFAULT_PORTFOLIO) {
      expect(ownerStepsForLine(line.id).length, `${line.id} maps to no owner step`).toBeGreaterThan(0);
    }
  });

  it("names only live lines in a step's unlocks", () => {
    // The mirror failure: a killed line left in a step keeps an owner step alive
    // for work nobody will do.
    const live = new Set(DEFAULT_PORTFOLIO.map((l) => l.id));
    for (const step of OWNER_STEPS) {
      expect(step.lines.length, `${step.id} unlocks no line`).toBeGreaterThan(0);
      for (const id of step.lines) {
        expect(live.has(id), `owner step ${step.id} names "${id}", which is not a live revenue line`).toBe(true);
      }
    }
  });

  it("gives every line with a humanSetup entry at least one step to point at", () => {
    for (const line of DEFAULT_PORTFOLIO) {
      if (line.humanSetup.length === 0) continue;
      const steps = ownerStepsForLine(line.id);
      expect(steps.length, `${line.id} has ${line.humanSetup.length} setup notes and no step`).toBeGreaterThan(0);
      // Each note should be at least as specific as naming its step, so the
      // owner reading the report can find it in the Hebrew document.
      for (const note of line.humanSetup) {
        expect(note).toMatch(/owner step \d/i);
      }
    }
  });

  it("routes each line to the steps that actually gate it", () => {
    expect(ownerStepsForLine("oss-bounties").map((s) => s.id))
      .toEqual(["merge-pr", "tax-file", "github-org", "algora-stripe", "ci-tokens"]);
    expect(ownerStepsForLine("pcn874").map((s) => s.id))
      .toEqual(["merge-pr", "tax-file", "gumroad", "domain", "github-org", "ci-tokens"]);
    // The org must come before Algora: a bounty pull request is a published
    // byline, and the machine account created in step 7 is what signs it.
    const bounty = ownerStepsForLine("oss-bounties");
    expect(bounty.findIndex((s) => s.id === "github-org"))
      .toBeLessThan(bounty.findIndex((s) => s.id === "algora-stripe"));
  });
});

describe("the owner's ₪0 rule and standing consent of 27.9.2026", () => {
  it("freezes exactly one step — the domain, the only one that costs money", () => {
    const frozen = OWNER_STEPS.filter((s) => s.frozen);
    expect(frozen.map((s) => s.id)).toEqual(["domain"]);
    const f = ownerStepById("domain")!.frozen!;
    expect(f.since).toBe("2026-09-27");
    expect(f.rule).toBe("the owner's ₪0 rule of 27.9.2026");
    // Frozen is not done: it comes back when the owner decides, so it keeps its
    // number and its lines, and it must not be recorded as finished.
    expect(ownerStepById("domain")!.doneOn).toBeUndefined();
    expect(ownerStepById("domain")!.number).toBe(5);
  });

  it("says plainly what going without the domain costs, and what replaces it free", () => {
    const f = ownerStepById("domain")!.frozen!;
    expect(f.costs).toMatch(/netlify\.app/);
    expect(f.costs).toMatch(/search|SEO/i);
    expect(f.costs).toMatch(/com\.mehudak/);
    expect(f.freeInstead).toMatch(/\*\.netlify\.app/);
    expect(f.freeInstead).toMatch(/io\.github\./);
    expect(f.freeInstead).toMatch(/step 7/);
    expect(f.returnsWhen).toMatch(/income/);
    // The step's own decision text no longer says the ₪200 is there to spend.
    expect(ownerStepById("domain")!.ownerDecision).toMatch(/suspended/);
    expect(ownerStepById("domain")!.ownerDecision).not.toMatch(/is the one card payment from the ₪200 float/);
  });

  it("stops asking for a frozen step without losing which lines it gates", () => {
    expect(isOwnerStepOpen(ownerStepById("domain")!)).toBe(false);
    expect(isOwnerStepOpen(ownerStepById("merge-pr")!)).toBe(false);
    expect(isOwnerStepOpen(ownerStepById("gumroad")!)).toBe(true);
    for (const id of ["il-biz-tools", "pcn874"]) {
      expect(ownerStepsForLine(id).map((s) => s.id)).toContain("domain");
      expect(openOwnerStepsForLine(id).map((s) => s.id)).not.toContain("domain");
      expect(frozenOwnerStepsForLine(id).map((s) => s.id)).toEqual(["domain"]);
    }
    // Step 2 is not asked either: it is held by its precondition (next describe).
    expect(openOwnerStepsForLine("pcn874").map((s) => s.number)).toEqual([3, 7, 6]);
    expect(frozenOwnerStepsForLine("apify-actors")).toEqual([]);
  });

  it("no longer asks the owner, in any line's setup notes, to buy a domain", () => {
    for (const line of DEFAULT_PORTFOLIO) {
      for (const note of line.humanSetup) {
        expect(note, `${line.id}: "${note}"`).not.toMatch(/^Buy the company domain/);
        expect(note, `${line.id}: "${note}"`).not.toMatch(/Buy the company domain \(owner step 5\) and/);
      }
    }
  });

  it("records the standing consent to merge and publish, and PR #3's merge", () => {
    const merge = ownerStepById("merge-pr")!;
    expect(merge.unlocks).toMatch(/standing consent/);
    expect(merge.unlocks).toMatch(/עצור/);
    expect(merge.unlocks).not.toMatch(/does not merge on its own initiative/);
    expect(merge.doneOn!.evidence).toMatch(/61fae4e/);
  });

  it("holds step 2 back until a paid product is ready and its cost is checked at the official source", () => {
    const tax = ownerStepById("tax-file")!;
    expect(tax.precondition!.what).toMatch(/paid product is ready/);
    expect(tax.precondition!.what).toMatch(/official sources/);
    expect(tax.precondition!.what).toMatch(/minimum monthly payments/);
    expect(tax.precondition!.short).toMatch(/paid product is ready/);
    expect(tax.precondition!.short).toMatch(/official cost check/);
    // It states no figure: the colony has not rendered that source.
    for (const text of [tax.precondition!.what, tax.precondition!.short]) {
      expect(text.replaceAll("₪0 rule", "")).not.toMatch(/₪\s?\d|\d+\s?(ILS|NIS|shekel)/i);
    }
  });

  it("does not ask the owner for step 2 while its precondition is unmet, but keeps it gating every line", () => {
    // The fail-open this closes: the precondition used to be prose nobody read,
    // so the hourly report went on asking for step 2 first — and a ₪0-rule owner
    // following it could register and start recurring payments before the
    // colony had checked whether registering costs anything.
    const tax = ownerStepById("tax-file")!;
    expect(tax.precondition!.metOn).toBeUndefined();
    expect(hasPendingPrecondition(tax)).toBe(true);
    expect(isOwnerStepOpen(tax)).toBe(false);
    expect(tax.doneOn).toBeUndefined();
    for (const id of tax.lines) {
      expect(ownerStepsForLine(id).map((s) => s.id), id).toContain("tax-file");
      expect(openOwnerStepsForLine(id).map((s) => s.id), id).not.toContain("tax-file");
      expect(heldOwnerStepsForLine(id).map((s) => s.id), id).toEqual(["tax-file"]);
    }
    // Only step 2 is held; a frozen step is reported as frozen, not as held.
    expect(OWNER_STEPS.filter(hasPendingPrecondition).map((s) => s.id)).toEqual(["tax-file"]);
    expect(heldOwnerStepsForLine("il-biz-tools").map((s) => s.id)).not.toContain("domain");
  });

  it("asks for step 2 again once the colony records its precondition met", () => {
    const met = OWNER_STEPS.map((s) =>
      s.id === "tax-file"
        ? { ...s, precondition: { ...s.precondition!, metOn: { date: "2026-10-01", evidence: "test" } } }
        : s,
    );
    const tax = met.find((s) => s.id === "tax-file")!;
    expect(hasPendingPrecondition(tax)).toBe(false);
    expect(isOwnerStepOpen(tax)).toBe(true);
    expect(openOwnerStepsForLine("pcn874", met).map((s) => s.number)).toEqual([2, 3, 7, 6]);
    expect(heldOwnerStepsForLine("pcn874", met)).toEqual([]);
  });

  it("keeps the board's pinned order: the ₪0 sequence is text until the board re-rules", () => {
    expect(ownerStepsInOrder().map((s) => s.number)).toEqual([1, 2, 3, 5, 7, 4, 6]);
  });
});

describe("the Hebrew document has not drifted from the code", () => {
  it("carries the same seven numbered headings", () => {
    const numbers = [...doc.matchAll(/^##\s*צעד\s*(\d+)\s*—/gm)].map((m) => Number(m[1]));
    expect(numbers.sort((a, b) => a - b)).toEqual(OWNER_STEPS.map((s) => s.number).sort((a, b) => a - b));
  });

  it("states the same execution order the code sorts by", () => {
    // The document tells the owner "1 → 2 → 3 → 5 → 7 → 4 → 6". If the code is
    // reordered and the document is not, the owner does the wrong thing first —
    // and the wrong thing first here costs a month of the Apify count.
    const stated = doc.match(/(\d(?:\s*→\s*\d){6})/);
    expect(stated, "docs/OWNER_STEPS.he.md no longer states an execution order").toBeTruthy();
    const order = stated![1].split("→").map((n) => Number(n.trim()));
    expect(order).toEqual(ownerStepsInOrder().map((s) => s.number));
  });

  it("marks exactly the steps the code records as done", () => {
    // The report stops asking for a step once the code records it done, so the
    // document and the data must agree on which ones those are.
    const headings = [...doc.matchAll(/^##\s*צעד\s*(\d+)\s*—(.*)$/gm)];
    for (const [, num, rest] of headings) {
      const step = OWNER_STEPS.find((s) => s.number === Number(num))!;
      expect(rest.includes("✅ בוצע"), `step ${num}: heading and doneOn disagree`).toBe(Boolean(step.doneOn));
    }
  });

  it("quotes, for each held step, exactly what the hourly report prints", () => {
    // The document tells the owner how a held step looks in REPORT.md. If the
    // report's wording changes and the document does not, the owner looks for a
    // phrase that is no longer there.
    for (const step of OWNER_STEPS.filter(hasPendingPrecondition)) {
      expect(doc, `step ${step.number}: the document does not quote the report's held note`)
        .toContain(`not asked now: step ${step.number} ${step.precondition!.short}`);
    }
  });

  it("marks exactly the steps the code records as frozen", () => {
    const headings = [...doc.matchAll(/^##\s*צעד\s*(\d+)\s*—(.*)$/gm)];
    for (const [, num, rest] of headings) {
      const step = OWNER_STEPS.find((s) => s.number === Number(num))!;
      expect(rest.includes("⏸ מוקפא"), `step ${num}: heading and frozen disagree`).toBe(Boolean(step.frozen));
    }
  });

  it("opens with the ₪0 rule in the owner's own words, and the free steps first", () => {
    const box = doc.slice(doc.indexOf("### כלל ה-0 ₪ (27.9)"), doc.indexOf("סדר ביצוע של הדירקטוריון"));
    expect(box.length, "the ₪0 box is missing or comes after the board's order").toBeGreaterThan(200);
    expect(box).toContain("אפילו לא שקל");
    expect(box).toMatch(/ה-₪200 שאישרת ב-3\.9 \*\*מושהים\*\*/);
    // The free sequence, in order: Apify half of 6, then 7, then Netlify half of
    // 6, then 3, then 2 only when a paid product is ready.
    const at = (needle: string) => {
      const i = box.indexOf(needle);
      expect(i, `the ₪0 box does not mention "${needle}"`).toBeGreaterThan(-1);
      return i;
    };
    const order = [
      at("**צעד 6 — רק החלק של Apify**"),
      at("**צעד 7**"),
      at("**צעד 6 — חיבור Netlify.**"),
      at("**צעד 3 — חשבון Gumroad.**"),
      at("**צעד 2 — רק כשמוצר בתשלום מוכן למכירה**"),
    ];
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // And it says the code's order awaits the board, rather than silently diverging.
    expect(box).toContain("ממתין לפסיקה");
  });

  it("records the standing consent and PR #3 where it talks about merging", () => {
    const step1 = doc.slice(doc.indexOf("## צעד 1"), doc.indexOf("## צעד 2"));
    expect(step1).toContain("61fae4e");
    expect(step1).toContain("אישור קבוע");
    expect(step1).toContain("\"עצור\"");
  });

  it("says in step 2 that the cost is checked at the official source first, and names no figure for it", () => {
    const step2 = doc.slice(doc.indexOf("## צעד 2"), doc.indexOf("## צעד 3"));
    expect(step2).toContain("מהמקור הרשמי");
    expect(step2).toContain("תשלום חודשי מינימלי");
    expect(step2).toContain("רק כשמוצר בתשלום מוכן");
  });

  it("says in step 5 what the freeze costs and what replaces it free", () => {
    const step5 = doc.slice(doc.indexOf("## צעד 5"), doc.indexOf("## צעד 6"));
    expect(step5).toContain("netlify.app");
    expect(step5).toContain("io.github.mehudak");
    expect(step5).toContain("com.mehudak");
    expect(step5).toContain("גוגל");
    expect(step5).not.toContain("תשלום אחד מתוך ה-₪200 שאישרת");
  });

  it("still tells the owner the Apify token may go in right after step 1", () => {
    expect(doc).toMatch(/Apify/);
    expect(doc).toMatch(/מיד אחרי צעד 1|אחרי צעד 1/);
  });
});
