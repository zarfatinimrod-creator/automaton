import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  OWNER_STEPS,
  askedSecretRows,
  followUpSecretRows,
  frozenOwnerStepsForLine,
  hasPendingPrecondition,
  heldFollowUpSecretRows,
  heldOwnerStepsForLine,
  heldSecretRows,
  isOwnerStepOpen,
  isSecretRowAsked,
  linesWithNoOwnerStep,
  openOwnerStepsForLine,
  ownerStepById,
  ownerStepMinutes,
  ownerStepsForLine,
  ownerStepsInOrder,
  secretRowsPastedBeforeMade,
} from "../../revenue/owner-steps.js";
import { DEFAULT_PORTFOLIO } from "../../revenue/portfolio.js";
import { readSite } from "../../revenue/page-views-reader.js";

const repoRoot = path.resolve(__dirname, "../../..");
const doc = fs.readFileSync(path.join(repoRoot, "docs/OWNER_STEPS.he.md"), "utf-8");

describe("the owner's checklist is eight steps and stays eight", () => {
  it("has exactly eight steps, with stable numbers 1..8", () => {
    // MISSION rule 1: never invent a step. The failure mode is drift, not a bad
    // decision — the chief audit found six catalogue items written out as
    // eleven, because "register as osek patur" was repeated once per line and an
    // accountant conversation had been added by someone reasoning about tax. A
    // new step should require a decision, so it fails the build.
    //
    // CHANGED DELIBERATELY on 28.9.2026: the breadth board admitted step 8, the
    // brand mailbox, and asked for it now (research/breadth/BOARD.md Q2 and
    // §"Exact changes"). That ruling is the decision; seven became eight here and
    // nowhere else. A ninth step fails this test until a board rules it in.
    expect(OWNER_STEPS).toHaveLength(8);
    expect(OWNER_STEPS.map((s) => s.number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(new Set(OWNER_STEPS.map((s) => s.id)).size).toBe(8);
  });

  it("runs in the board's order with step 8 second: 1, 8, 2, 3, 5, 7, 4, 6", () => {
    // BOARD.md §5 (7.9.2026) ruled 1, 2, 3, 5, 7, 4, 6. The breadth board of 28.9.2026 (research/breadth/BOARD.md
    // Q2) put the brand mailbox second, straight after merge-pr, in the ask-now sequence. The numbers stay fixed so
    // an earlier conversation about "step 4" still means the same step; only the order moved.
    expect(ownerStepsInOrder().map((s) => s.number)).toEqual([1, 8, 2, 3, 5, 7, 4, 6]);
    expect(ownerStepsInOrder().map((s) => s.id)).toEqual([
      "merge-pr", "brand-mailbox", "tax-file", "gumroad", "domain", "github-org", "algora-stripe", "ci-tokens",
    ]);
    expect(OWNER_STEPS.map((s) => s.order).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("lets the Apify half of step 6 be done straight after step 1, and step 6 is the only step with an early part", () => {
    // The early part and the reason the list has them at all: the token starts the
    // 30-day stranger count a month earlier than the rest of the checklist would
    // allow, and it needs no identity check. Step 4's early part (4a) was dropped
    // on 28.9.2026 (research/breadth/BOARD.md Part B(b)).
    const early = OWNER_STEPS.filter((s) => s.earlyPart);
    expect(early.map((s) => s.id)).toEqual(["ci-tokens"]);
    const apify = ownerStepById("ci-tokens")!.earlyPart!;
    expect(apify.afterStep).toBe("merge-pr");
    expect(apify.what).toMatch(/APIFY_TOKEN/);
    // Ruling 7.10 (research/channel-loop/RULING-2026-10-07-posthog-organisation.md §1-§2): part ד, the owner's two PostHog
    // organisations, joins the early part beside the Apify token, and the early part goes from 5 minutes to 8.
    expect(apify.what).toMatch(/PostHog/);
    expect(apify.minutes).toBe(8);
  });

  it("makes step 4 the Stripe form alone, 4b, held for a held reward — 4a is dropped (research/breadth/BOARD.md Part B(b))", () => {
    // 4a's only stated reason — creating the Algora user a reward's credit needs — is refuted at code grade: a /claim
    // creates the solver's user from the GitHub login (workspace.ex ensure_user → create_user_from_github). MISSION
    // rule 1: never invent a step that isn't required. The form necessarily begins with the sign-in, so nothing is lost.
    const step4 = ownerStepById("algora-stripe")!;
    expect(step4.earlyPart).toBeUndefined();
    expect(step4.minutes).toEqual([15, 15]);
    // Held, not asked: the report names it outside the asked-now list until the colony records both conditions met.
    expect(hasPendingPrecondition(step4)).toBe(true);
    expect(isOwnerStepOpen(step4)).toBe(false);
    expect(step4.precondition!.what).toMatch(/week-4/);
    expect(step4.precondition!.what).toMatch(/held/);
    expect(step4.precondition!.what).toMatch(/begins with signing in to Algora/);
    expect(step4.precondition!.short).toMatch(/begins with the Algora sign-in/);
    for (const text of [step4.precondition!.what, step4.precondition!.short, step4.unlocks]) {
      expect(text).not.toMatch(/\b4a\b|two-minute sign-in|2-minute sign-in/);
    }
    expect(step4.precondition!.short).not.toMatch(/[();]/); // it is printed inside the report's parentheses
    expect(`step ${step4.number} ${step4.precondition!.short}`).not.toMatch(/^step 4 4/); // printed after "step 4 "
    expect(openOwnerStepsForLine("oss-bounties").map((s) => s.number)).toEqual([7, 6]);
    expect(heldOwnerStepsForLine("oss-bounties").map((s) => s.number)).toEqual([2, 4]);
    // The retired justification is gone (§4.3).
    expect(step4.unlocks).not.toMatch(/settles? (?:the )?Stripe-Israel|for every other Stripe-Connect platform/);
    expect(step4.unlocks).toMatch(/Algora/);
    // Step 7's sitting keeps only the token.
    expect(ownerStepById("github-org")!.unlocks).not.toMatch(/\b4a\b|signs in to Algora once/);
  });

  it("adds step 8, the brand mailbox, asked now and free (research/breadth/BOARD.md Q2)", () => {
    const step8 = ownerStepById("brand-mailbox")!;
    expect(step8.number).toBe(8);
    expect(step8.order).toBe(2);
    expect(step8.minutes).toEqual([10, 10]);
    expect(step8.lines).toEqual(["il-biz-tools"]);
    // Consent-and-account, not identity: no chief-audit catalogue item, and nothing holds it back.
    expect(step8.catalogueRef).toBeNull();
    expect(isOwnerStepOpen(step8)).toBe(true);
    expect(step8.frozen).toBeUndefined();
    expect(step8.precondition).toBeUndefined();
    // The specification Q2 fixes.
    expect(step8.unlocks).toMatch(/Google account under the brand/);
    expect(step8.unlocks).toMatch(/Outlook\.com/);
    // Play Books was killed 28.9 (tick 6, Israel not a supported country): it is recorded, not offered as a use.
    expect(step8.unlocks).not.toMatch(/serves Google Play Books/);
    expect(step8.unlocks).toMatch(/Play Books Partner Center was another use[^:]*killed/);
    expect(step8.unlocks).not.toMatch(/third use/);
    expect(step8.unlocks).toMatch(/Search Console/);
    expect(step8.unlocks).toMatch(/YouTube/);
    // Ruling 30.9 16(c) (RULING-2026-09-30-video.md): YouTube Stage A leaves step 8's account for a dedicated brand
    // Google account, so the step-8 account no longer "serves YouTube Stage A".
    expect(step8.unlocks).toMatch(/serves Search Console; YouTube Stage A uses a dedicated brand Google account \(ruling 30\.9 16\(c\)\)/);
    expect(step8.unlocks).not.toMatch(/serves YouTube Stage A/);
    expect(step8.unlocks).toMatch(/second Gmail connector/);
    // CHANGED 28.9.2026 (brand-mail review, exposure finding 1): the CI secret lives in the environment brand-mailbox,
    // limited to main, because a repository secret reaches every branch and every workflow.
    expect(step8.unlocks).toMatch(/secret of the GitHub environment brand-mailbox, whose deployment branches are limited to main/);
    expect(step8.unlocks).toMatch(/not a repository secret/);
    // The probe and the responder are specified, not built (CHANNEL_LOOP §1 still has the probe as an open item), so the
    // text says what WILL happen once the step is done — review of the builder diff, finding 7.
    expect(step8.unlocks).toMatch(/once step 8 is done, the tick's probe will report the unread count/i);
    expect(step8.unlocks).toMatch(/the colony will answer accessibility mail itself/);
    // CHANGED 28.9.2026 (brand-mail tooling): the probe is now built but unscheduled, so "neither exists yet" became
    // false; the text says what is built, what is not, and that neither runs before the step.
    expect(step8.unlocks).toMatch(/neither runs yet/);
    expect(step8.unlocks).not.toMatch(/neither exists yet/);
    expect(step8.unlocks).toMatch(/scripts\/brand_mail\.py/);
    expect(step8.unlocks).toMatch(/brand-mail\.yml, dispatch only/);
    expect(step8.unlocks).toMatch(/the responder is not built/);
    expect(step8.unlocks).toMatch(/research\/owner-asks\/questions\.json/);
    expect(step8.unlocks).not.toMatch(/the tick's probe reports|colony answers accessibility mail itself/);
    expect(step8.unlocks).toMatch(/discloses that it comes from the company's automated operator/);
    expect(step8.unlocks).toMatch(/published only as the brand's accessibility contact/);
    expect(step8.unlocks).toMatch(/never the owner's personal Gmail/);
    expect(step8.unlocks).toMatch(/CrazyGames/);
    expect(step8.unlocks).toMatch(/Spreadshirt/);
    // il-biz-tools now waits on it, first in its asked-now list.
    expect(openOwnerStepsForLine("il-biz-tools").map((s) => s.number)).toEqual([8, 3, 6]);
    // Loop board 29.9.2026 (RULING-2026-09-29-loop.md (b)): what waits on the mailbox, counted once.
    // npm step 9 is proposed, not asked, and Displate is not admitted (ruling (c)): both are qualified so neither reads as
    // a step on the way (review of the loop-board diff, finding 6).
    expect(step8.unlocks).toMatch(/seven written questions, il-biz-tools' publish gate, the pcn874 page, npm's account \(proposed step 9, not yet asked\) and Displate's login \(if Displate is admitted\)/);
    expect(step8.unlocks).toMatch(/first among the free steps/);
  });

  it("prints three stop rules on step 4, and on no other step (§4.2)", () => {
    const withStops = OWNER_STEPS.filter((s) => s.stopIf);
    expect(withStops.map((s) => s.id)).toEqual(["algora-stripe"]);
    const stops = ownerStepById("algora-stripe")!.stopIf!;
    expect(stops).toHaveLength(3);
    expect(stops[0]).toMatch(/United States/);
    expect(stops[0]).toMatch(/SSN/);
    expect(stops[1]).toMatch(/selfie|liveness/i);
    expect(stops[2]).toMatch(/fee|payment|deposit/i);
  });

  it("makes BRAND_GITHUB_TOKEN in step 7's sitting, and step 6 no longer holds it back (§4.4)", () => {
    expect(ownerStepById("github-org")!.unlocks).toMatch(/same sitting/);
    expect(ownerStepById("github-org")!.unlocks).toMatch(/BRAND_GITHUB_TOKEN/);
    expect(ownerStepById("ci-tokens")!.unlocks).not.toMatch(/held until step 4/i);
  });

  it("keeps each step to the identity, KYC or payout work a platform actually requires", () => {
    for (const step of OWNER_STEPS) {
      expect(step.unlocks.length, `${step.id} does not say what it unlocks`).toBeGreaterThan(60);
      expect(step.minutes[0]).toBeGreaterThan(0);
      expect(step.minutes[1]).toBeGreaterThanOrEqual(step.minutes[0]);
    }
    // Six of the eight map to a chief-audit catalogue item. The other two are
    // the PR merge, which is consent rather than identity, and the brand mailbox
    // (28.9.2026), which is a brand account with no identity check — both are
    // correctly absent from that catalogue, so a null here is the honest value.
    const catalogued = OWNER_STEPS.filter((s) => s.catalogueRef !== null);
    expect(catalogued).toHaveLength(6);
    expect(ownerStepById("merge-pr")!.catalogueRef).toBeNull();
    expect(ownerStepById("brand-mailbox")!.catalogueRef).toBeNull();
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

  // Review of the breadth-board builder diff, finding 5: the report said "steps 8, 3, 6" for il-biz-tools while its
  // checklist (humanSetup) showed only 3 and 6, so humanSetupDone could be set without the mailbox.
  it("names owner step 8 in the setup notes of every line it gates, first", () => {
    const step8 = ownerStepById("brand-mailbox")!;
    for (const id of step8.lines) {
      const line = DEFAULT_PORTFOLIO.find((l) => l.id === id)!;
      expect(line.humanSetup[0], `${id}: the mailbox note should come first`).toMatch(/^Open the brand mailbox \(owner step 8\)/);
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

// Tick 32: the report stopped asking nothing when a step was done — each line's items were free text, so an item for
// step 6 stayed "- [ ]" after step 6. Each item is now linked to its steps in data (portfolio.ts `humanSetupItems`),
// and the link must say exactly what the text says, or it hides an open item or keeps asking a done one.
describe("each humanSetup item is linked to exactly the owner steps its text names", () => {
  const namedInText = (text: string) =>
    [...new Set([...text.matchAll(/\bstep (\d+)/gi)].map((m) => Number(m[1])))].sort((a, b) => a - b);

  it("links every item of every line, one link per stored text, in the same order", () => {
    for (const line of DEFAULT_PORTFOLIO) {
      expect(line.humanSetupItems?.map((i) => i.text) ?? [], `${line.id}: items and stored texts differ`).toEqual(line.humanSetup);
    }
  });

  it("links the steps an item belongs to plus the ones it names only as context — no more, no fewer", () => {
    for (const line of DEFAULT_PORTFOLIO) {
      for (const item of line.humanSetupItems ?? []) {
        const where = `${line.id}: "${item.text.slice(0, 70)}…"`;
        // The check below reads "step N" only; a plural ("steps 3 and 6") would slip past it, so it fails here instead.
        expect(item.text, `${where} — name each step as "step N" so the link check reads it`).not.toMatch(/\bsteps \d/i);
        const linked = [...item.steps, ...(item.contextSteps ?? [])].sort((a, b) => a - b);
        expect(linked, `${where} — linked steps differ from the steps its text names`).toEqual(namedInText(item.text));
        expect(item.steps.length, `${where} belongs to no step`).toBeGreaterThan(0);
        for (const n of item.steps) {
          const step = OWNER_STEPS.find((s) => s.number === n);
          expect(step, `${where} names step ${n}, which is not on the checklist`).toBeDefined();
          expect(step!.lines, `${where}: step ${n} does not gate ${line.id}`).toContain(line.id);
        }
        for (const n of item.contextSteps ?? []) {
          expect(OWNER_STEPS.some((s) => s.number === n), `${where} names step ${n} as context`).toBe(true);
        }
      }
    }
  });

  it("links the items that name more than one step as the texts read", () => {
    const item = (id: string, i: number) => DEFAULT_PORTFOLIO.find((l) => l.id === id)!.humanSetupItems![i];
    // "(owner step 6; this half may be done straight after step 1)": step 1 is an order note, not part of the item.
    expect([item("apify-actors", 0).steps, item("apify-actors", 0).contextSteps]).toEqual([[6], [1]]);
    // The machine account is step 7; its token is "made with step 7, pasted in step 6" — both are the item's.
    expect([item("oss-bounties", 0).steps, item("oss-bounties", 0).contextSteps]).toEqual([[7, 6], undefined]);
    // "(The company domain, owner step 5, is frozen … and is not asked for.)": named, never asked.
    expect([item("pcn874", 2).steps, item("pcn874", 2).contextSteps]).toEqual([[6], [5]]);
  });
});

// Tick 32 review. The report drops a setup item once every step it belongs to has a `doneOn`, so a `doneOn` must mean
// what it says. Step 6 pastes two tokens other steps make — GUMROAD_ACCESS_TOKEN (step 3) and BRAND_GITHUB_TOKEN (step
// 7's sitting) — and `heldRows` may name only gated rows, so a done step 6 says both were pasted. Recorded before step 3
// or step 7, that is impossible, and the report would stop asking the pastes: "Link the repo in Netlify and paste
// GUMROAD_ACCESS_TOKEN (owner step 6)" would go while the token did not exist yet.
describe("a secret another step makes is never recorded pasted before that step is done", () => {
  const step6 = ownerStepById("ci-tokens")!;
  const done = (date: string, heldRows?: string[]) => ({ date, evidence: "test only", ...(heldRows ? { heldRows } : {}) });
  const withDoneOn = (doneOn: Partial<Record<"gumroad" | "github-org" | "ci-tokens", ReturnType<typeof done>>>) =>
    OWNER_STEPS.map((s) => (s.id in doneOn ? { ...s, doneOn: doneOn[s.id as keyof typeof doneOn] } : s));

  it("holds on the checklist as recorded", () => {
    expect(secretRowsPastedBeforeMade()).toEqual([]);
  });

  it("says which step makes each row whose source names another step, and no other row", () => {
    for (const step of OWNER_STEPS) {
      for (const row of step.secrets ?? []) {
        const named = [...row.source.matchAll(/\bstep (\d+)/gi)].map((m) => Number(m[1])).filter((n) => n !== step.number);
        const maker = row.madeIn ? ownerStepById(row.madeIn) : undefined;
        expect(maker ? [maker.number] : [], `step ${step.number}'s ${row.name}: madeIn vs its source`).toEqual(named);
      }
    }
    expect(step6.secrets!.filter((r) => r.madeIn).map((r) => `${r.name}<-${r.madeIn}`)).toEqual([
      "GUMROAD_ACCESS_TOKEN<-gumroad",
      "BRAND_GITHUB_TOKEN<-github-org",
      // Ruling 4.10 (RULING-2026-10-04-mozilla-precondition.md §2): the organisation's budgets read token.
      "ORG_BUDGETS_READ_TOKEN<-github-org",
    ]);
  });

  it("catches a done step 6 recorded before step 3 or step 7, or on an earlier date", () => {
    const alone = secretRowsPastedBeforeMade(withDoneOn({ "ci-tokens": done("2026-10-02", ["POSTHOG_READ_KEY"]) }));
    expect(alone).toHaveLength(3);
    expect(alone[0]).toMatch(/GUMROAD_ACCESS_TOKEN.*step 3/);
    expect(alone[1]).toMatch(/BRAND_GITHUB_TOKEN.*step 7/);
    expect(alone[2]).toMatch(/ORG_BUDGETS_READ_TOKEN.*step 7/);
    const early = secretRowsPastedBeforeMade(withDoneOn({
      gumroad: done("2026-10-03"),
      "github-org": done("2026-10-01"),
      "ci-tokens": done("2026-10-02", ["POSTHOG_READ_KEY"]),
    }));
    expect(early).toHaveLength(1);
    expect(early[0]).toMatch(/GUMROAD_ACCESS_TOKEN.*2026-10-03/);
    // The same day, or later, is what the Hebrew document asks: step 6's Gumroad row "כשצעד 3 בוצע".
    expect(secretRowsPastedBeforeMade(withDoneOn({
      gumroad: done("2026-10-02"),
      "github-org": done("2026-10-01"),
      "ci-tokens": done("2026-10-02", ["POSTHOG_READ_KEY"]),
    }))).toEqual([]);
  });

  it("compares dates it can compare: every doneOn date is YYYY-MM-DD", () => {
    for (const step of OWNER_STEPS) {
      for (const d of [step.doneOn?.date, ...(step.secrets ?? []).map((r) => r.doneOn?.date)]) {
        if (d !== undefined) expect(d, `step ${step.number}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
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
      // oss-bounties is also held on step 4b since 28.9.2026 (RULING-2026-09-28-bounty-rail.md §4.1).
      expect(heldOwnerStepsForLine(id).map((s) => s.id), id).toEqual(id === "oss-bounties" ? ["tax-file", "algora-stripe"] : ["tax-file"]);
    }
    // Steps 2 and 4 are held; a frozen step is reported as frozen, not as held.
    expect(OWNER_STEPS.filter(hasPendingPrecondition).map((s) => s.id).sort()).toEqual(["algora-stripe", "tax-file"]);
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
    expect(ownerStepsInOrder().map((s) => s.number)).toEqual([1, 8, 2, 3, 5, 7, 4, 6]);
  });
});

describe("the Hebrew document has not drifted from the code", () => {
  it("carries the same eight numbered headings", () => {
    const numbers = [...doc.matchAll(/^##\s*צעד\s*(\d+)\s*—/gm)].map((m) => Number(m[1]));
    expect(numbers.sort((a, b) => a - b)).toEqual(OWNER_STEPS.map((s) => s.number).sort((a, b) => a - b));
  });

  it("states the same execution order the code sorts by", () => {
    // The document tells the owner "1 → 8 → 2 → 3 → 5 → 7 → 4 → 6". If the code is
    // reordered and the document is not, the owner does the wrong thing first —
    // and the wrong thing first here costs a month of the Apify count.
    const stated = doc.match(/(\d(?:\s*→\s*\d){7})/);
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
    // The free sequence, in order: step 8 (the brand mailbox, asked now since the
    // breadth board of 28.9.2026), then the Apify half of 6, then 7, then Netlify
    // half of 6, then 3, then 2 only when a paid product is ready. Since ruling 7.10
    // (RULING-2026-10-07-posthog-organisation.md §2 edit 9) the second item is step 6's Apify and PostHog parts together.
    const at = (needle: string) => {
      const i = box.indexOf(needle);
      expect(i, `the ₪0 box does not mention "${needle}"`).toBeGreaterThan(-1);
      return i;
    };
    const order = [
      at("**צעד 8 — תיבת דואר של המותג**"),
      at("**צעד 6 — רק החלק של Apify והחלק של PostHog**"),
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

  // research/tiktok/08-sales-marketing-lessons.md §8.1 N6: a buyer's receipt reply, refund request or question goes to
  // the email the Gumroad account was opened with, so that email is the step-8 brand mailbox, never a personal one;
  // and the product job refuses to enable the Pro product until the brand-mail probe is green.
  it("opens step 3's Gumroad account with the step-8 brand mailbox, never a personal address", () => {
    const step3 = doc.slice(doc.indexOf("## צעד 3"), doc.indexOf("## צעד 4"));
    const todo = step3.slice(step3.indexOf("### מה לעשות"), step3.indexOf("### מה זה עושה"));
    const firstItem = todo.slice(todo.indexOf("1."), todo.indexOf("\n2."));
    expect(firstItem).toContain("צעד 8");
    expect(firstItem).toMatch(/לא כתובת אישית/);
    expect(firstItem).toContain("Mehudak");
    const gumroad = ownerStepById("gumroad")!;
    expect(gumroad.unlocks).toMatch(/brand mailbox \(owner step 8\)/);
    expect(gumroad.unlocks).toMatch(/never a personal address/);
    expect(gumroad.unlocks).toMatch(/refuses to enable/);
    // Step 8 comes first in both orders, so the mailbox exists when the account is opened.
    expect(ownerStepById("brand-mailbox")!.order).toBeLessThan(gumroad.order);
  });

  it("says in step 5 what the freeze costs and what replaces it free", () => {
    const step5 = doc.slice(doc.indexOf("## צעד 5"), doc.indexOf("## צעד 6"));
    expect(step5).toContain("netlify.app");
    expect(step5).toContain("io.github.mehudak");
    expect(step5).toContain("com.mehudak");
    expect(step5).toContain("גוגל");
    expect(step5).not.toContain("תשלום אחד מתוך ה-₪200 שאישרת");
  });

  it("writes step 4 as 4ב alone, with the paused box, the stop rules and the retired question (research/breadth/BOARD.md Part B(b))", () => {
    const step4 = doc.slice(doc.indexOf("## צעד 4"), doc.indexOf("## צעד 5"));
    // The paused box: held until the corrected week-4 count; the first count struck.
    expect(step4).toMatch(/⏸/);
    expect(step4).toContain("85 מתוך 108");
    expect(step4).toContain("CHANNEL_LOOP.md");
    // 4b only: 4a dropped on 28.9.2026, and the sign-in is 4b's first instruction.
    expect(step4).not.toContain("4א");
    expect(step4).toContain("4ב");
    expect(step4).toMatch(/\*\*זמן: 15 דקות/);
    expect(step4).not.toMatch(/2 דקות/);
    const todo = step4.slice(step4.indexOf("### מה לעשות"), step4.indexOf("### עצור אם"));
    const firstItem = todo.slice(todo.indexOf("1."), todo.indexOf("2."));
    expect(firstItem).toContain("Sign in with GitHub");
    expect(firstItem).toContain("חשבון המכונה");
    // The three stop rules, printed as "עצור אם".
    expect(step4).toContain("עצור אם");
    expect(step4).toContain("ארצות הברית");
    expect(step4).toContain("SSN");
    expect(step4).toContain("סלפי");
    expect(step4).toMatch(/תשלום|עמלה/);
    // ILS to an Israeli bank by local bank method, "Email, name" plus bank details, no fee.
    expect(step4).toContain("Email, name");
    expect(step4).toMatch(/בלי עמלה|אין עמלה/);
    // "מה יוצא לך מזה" item 2: the platform-level answer is rendered; this form answers whether Algora does.
    const gain = step4.slice(step4.indexOf("### מה יוצא לך מזה"));
    expect(gain).not.toContain("תשובה לשאלה שרדפה את כל המחקר");
    expect(gain).toMatch(/האם \*\*Algora\*\*/);
  });

  it("makes the token in step 7's sitting and lets step 6 paste it with the rest (§4.4); no 4א anywhere", () => {
    const step6 = doc.slice(doc.indexOf("## צעד 6"), doc.indexOf("## צעד 7"));
    const step7 = doc.slice(doc.indexOf("## צעד 7"), doc.indexOf("## צעד 8"));
    expect(step6).not.toContain("ואל תדביק אותו כרגע");
    expect(step7).toContain("BRAND_GITHUB_TOKEN");
    // 4a was dropped on 28.9.2026 (research/breadth/BOARD.md Part B(b)); the document names it nowhere.
    expect(doc).not.toContain("4א");
  });

  it("writes step 8, the brand mailbox, per the board's specification (research/breadth/BOARD.md Q2)", () => {
    const step8 = doc.slice(doc.indexOf("## צעד 8"), doc.indexOf("## מה מגיע רק אם"));
    expect(step8.length, "step 8 section missing, or not placed before the 'later' section").toBeGreaterThan(400);
    expect(step8).toMatch(/\*\*זמן: 10 דקות/);
    expect(step8).toContain("Google");
    expect(step8).toContain("Outlook.com");
    expect(step8).toContain("mehudak");
    expect(step8).toContain("Search Console");
    expect(step8).not.toMatch(/ישמש אחר כך גם ל-Google Play Books/);
    expect(step8).toMatch(/Play Books[^\n]*נפסלה/);
    expect(step8).toContain("YouTube");
    // Ruling 30.9 16(c): Stage A gets its own brand Google account; step 8's account keeps Search Console.
    expect(step8).toContain("לערוץ ה-YouTube (Stage A) ייפתח חשבון Google נפרד של המותג (פסיקה 30.9, 16(c))");
    expect(step8).not.toContain("גם ל-YouTube ול-Search Console");
    expect(step8).toContain("נגישות");
    expect(step8).toMatch(/Gmail האישי/);
    expect(step8).toContain("research/breadth/BOARD.md");
    // The probe and the sender were built on 28.9 (scripts/brand_mail.py) and wait for the mailbox; the accessibility
    // auto-reply is still future work. The document says exactly that, and never that anything already runs.
    expect(step8).not.toContain("בכל ריצה הדוח מראה");
    expect(step8).not.toContain("המערכת עונה בעצמה");
    expect(step8).toMatch(/אחרי שצעד 8 יבוצע/);
    expect(step8).toContain("scripts/brand_mail.py");
    expect(step8).toMatch(/המענה האוטומטי למיילי נגישות עוד לא נבנה/);
    // Step 8's secrets live in the brand-mailbox environment limited to main, never as plain repository secrets.
    expect(step8).toContain("brand-mailbox");
    expect(step8).toContain("BRAND_MAIL_APP_PASSWORD");
    expect(step8).not.toMatch(/כסוד בריפו/);
    // Gender-neutral: instructions in the infinitive, no second-person masculine imperatives.
    const todo = step8.slice(step8.indexOf("### מה לעשות"), step8.indexOf("### מה זה עושה"));
    expect(todo.length).toBeGreaterThan(100);
    expect(todo).not.toMatch(/(^|\s)(פתח|צור|היכנס|הירשם|תכתוב|תפתח|תיצור|שלח|בחר)(\s|$)/m);
  });

  // Review of the breadth-board builder diff, findings 3 and 4: the H1 says 8 but the first page still said "עד אז —
  // שבעה", the ledger estimate said "כל 7 הצעדים" undated, the order note said the code order would not change beside
  // a code order that had just changed, and the free batch named a network setting the document never explains.
  it("says eight wherever it counts today's steps, and dates every seven", () => {
    expect(doc).not.toMatch(/עד אז — שבעה/);
    expect(doc).toMatch(/עד אז — שמונה/);
    expect(doc).not.toMatch(/שכל 7 הצעדים/);
    expect(doc).not.toMatch(/"כל 7"/);
    expect(doc).not.toMatch(/ועד אז אני לא משנה אותו בקוד\./);
  });

  it("says where the network setting in the free batch is explained", () => {
    const outcome = doc.slice(doc.indexOf("## צעד 8"), doc.indexOf("## מה מגיע רק אם"));
    const sentence = outcome.slice(outcome.indexOf("ארבעת הצעדים החינמיים"));
    expect(sentence).toMatch(/הגדרת הרשת של הסביבה/);
    expect(sentence).toMatch(/ההוראות המדויקות/);
  });

  it("lists step 8 in the summary table and totals the minutes in the 'סך הכול' line", () => {
    const table = doc.slice(doc.indexOf("## סיכום בטבלה אחת"));
    expect(table).toMatch(/^\| 8 \| [^\n]*תיבת דואר[^\n]*\| 10 \|/m);
    expect(table).toMatch(/^\| 4 \| [^\n]*4ב[^\n]*\| 15 \|/m);
    expect(table).not.toContain("4א");
    expect(table).toContain("**סך הכול");
  });

  it("names PayPal Israel as proposed step 13 and Apify verification at the Publish sitting (Q3, Q5)", () => {
    const later = doc.slice(doc.indexOf("## מה מגיע רק אם"), doc.indexOf("## מה קורה אחרי שסיימת"));
    expect(later).toMatch(/PayPal ישראל[^\n]*צעד 13/);
    expect(later).toContain("סלפי");
    expect(later).toMatch(/Publish/);
    expect(later).toMatch(/אף פעם|לעולם לא/);
  });

  // Loop board 29.9.2026 (research/channel-loop/RULING-2026-09-29-loop.md (g)): condition (i), no selfie, liveness or
  // video in PayPal IL's public text, PASSES at rendered grade; the step stays held on (ii) and (iii).
  it("says PayPal's condition (i) is met and step 13 is held on (ii) and (iii) (ruling (g))", () => {
    const later = doc
      .slice(doc.indexOf("## מה מגיע רק אם"), doc.indexOf("## מה קורה אחרי שסיימת"))
      .replace(/\s+/g, " ");
    const paypal = later.slice(later.indexOf("**PayPal ישראל**"), later.indexOf("**USDC**"));
    expect(paypal).toMatch(/תנאי \(i\)[^.]*התקיים/);
    expect(paypal).toContain("(ii)");
    expect(paypal).toContain("(iii)");
    expect(paypal).toContain("RULING-2026-09-29-loop.md");
    expect(paypal).not.toMatch(/יבוקש רק כששלושה דברים נכונים יחד/);
  });

  // Loop board 29.9.2026 (a): Firefox Add-ons was killed on G4, so the proposed Mozilla add-ons account (step 14) goes.
  it("proposes no step 14 and no Mozilla add-ons account (ruling (a))", () => {
    expect(doc).not.toMatch(/צעד 14/);
    expect(doc).not.toMatch(/Firefox|add-ons|addons\.mozilla/i);
    // Ruling 4.10 (RULING-2026-10-04-mozilla-precondition.md §2 rule 3) names Mozilla once, in step 7, as one line that
    // would use the organisation's ₪0 fence and asks for nothing of its own; it is never an account or a step.
    const mentions = doc.split("\n").filter((l) => /Mozilla/.test(l));
    expect(mentions).toHaveLength(1);
    expect(mentions[0]).toContain("קו Mozilla (שורה 8 בלופ) הוא רק אחד הקווים שישתמשו בגדר");
    expect(doc.indexOf(mentions[0])).toBeGreaterThan(doc.indexOf("## צעד 7"));
    expect(doc.indexOf(mentions[0])).toBeLessThan(doc.indexOf("## צעד 8"));
  });

  // Loop board 29.9.2026 (b): no nagging, and only order and information may change. Step 8 unblocks more than any
  // other free step, so it is listed first among the free steps, and what waits on it is stated ONCE.
  it("lists step 8 first among the free steps and states once, plainly, what waits on it (ruling (b))", () => {
    const box = doc.slice(doc.indexOf("### כלל ה-0 ₪ (27.9)"), doc.indexOf("סדר ביצוע של הדירקטוריון"));
    const item8 = box.slice(box.indexOf("**צעד 8 — תיבת דואר של המותג**"), box.indexOf("**צעד 6 — רק החלק של Apify והחלק של PostHog**"));
    const flat = item8.replace(/>\s*/g, " ").replace(/\s+/g, " ");
    for (const waits of ["7 שאלות בכתב", "il-biz-tools", "pcn874", "npm", "Displate"]) {
      expect(flat, `the count line does not name "${waits}"`).toContain(waits);
    }
    // npm is not asked yet and Displate is not admitted: the line says so (review finding 6).
    expect(flat).toContain("חשבון npm שעוד לא מבוקש");
    expect(flat).toContain("Displate אם הזירה תתקבל");
    // Stated once in the whole document, and without pressure.
    expect(doc.match(/7 שאלות בכתב/g)).toHaveLength(1);
    expect(item8).not.toMatch(/!|דחוף|שוב ושוב|תזכורת/);
    // The step 8 section says first, not second, and the free-steps sentence names step 8 before the network setting.
    const step8 = doc.slice(doc.indexOf("## צעד 8"), doc.indexOf("## מה מגיע רק אם"));
    expect(step8).not.toContain("השני ברשימה החינמית");
    expect(step8).toContain("הראשון ברשימה החינמית");
    // The reason (it unblocks the most) is given once, with the count, not again in the step's own section (finding 5).
    expect(step8).not.toMatch(/משחרר יותר מכל צעד/);
    const sentence = step8.slice(step8.indexOf("ארבעת הצעדים החינמיים"));
    expect(sentence.indexOf("צעד 8")).toBeGreaterThan(-1);
    expect(sentence.indexOf("צעד 8")).toBeLessThan(sentence.indexOf("הגדרת הרשת של הסביבה"));
  });

  // Loop board 29.9.2026 (e)3: after step 2 the runner issues the payout documents the paying platforms need, under six
  // conditions; the owner signs nothing per payout. One sentence under step 2.
  it("says under step 2 that the company issues its own payout documents after it (ruling (e)3)", () => {
    const step2 = doc.slice(doc.indexOf("## צעד 2"), doc.indexOf("## צעד 3")).replace(/\s+/g, " ");
    expect(step2).toContain("החברה מפיקה בעצמה את מסמכי התשלום");
    expect(step2).toMatch(/לא חותמים על שום דבר בכל תשלום/);
    expect(step2).toContain("RULING-2026-09-29-loop.md");
    expect(ownerStepById("tax-file")!.unlocks).toMatch(/issues its own payout documents/);
    expect(ownerStepById("tax-file")!.unlocks).toMatch(/signs nothing per payout/);
  });

  // MISSION, anonymous publishing: the owner's personal GitHub handle is a personal identifier. The document names the
  // repository by name and the brand organisation, never a personal account's URL.
  it("carries no personal GitHub account in any repository URL", () => {
    expect(doc).not.toMatch(/github\.com\/(?!mehudak\b)[A-Za-z0-9-]+\/automaton/);
    expect(doc).not.toMatch(/github\.com\/[A-Za-z0-9-]*-creator/);
    // The rewritten line is in the infinitive like steps 6 and 7, never the masculine imperative (review finding 1).
    expect(doc).toContain("1. לפתוח את PR #2 בריפו `automaton`");
    expect(doc).not.toMatch(/^1\. פתח /m);
  });

  it("points the USDC line to the booking rule of RULING-2026-09-28-bounty-rail.md §6.2", () => {
    const later = doc.slice(doc.indexOf("## מה מגיע רק אם"), doc.indexOf("## מה קורה אחרי שסיימת"));
    expect(later).toMatch(/USDC/);
    expect(later).toContain("RULING-2026-09-28-bounty-rail.md");
    expect(later).toContain("§6.2");
  });

  it("still tells the owner the Apify token may go in right after step 1", () => {
    expect(doc).toMatch(/Apify/);
    expect(doc).toMatch(/מיד אחרי צעד 1|אחרי צעד 1/);
  });
});

// Documents ruling of 30.9.2026 (research/channel-loop/RULING-2026-09-30-documents.md), fold actions 1-3.
describe("step 2's wording as read, step 3's support field, and step 6's POSTHOG_READ_KEY row (ruling 30.9 documents)", () => {
  const step2Doc = doc.slice(doc.indexOf("## צעד 2"), doc.indexOf("## צעד 3"));
  const step3Doc = doc.slice(doc.indexOf("## צעד 3"), doc.indexOf("## צעד 4"));
  const step6Doc = doc.slice(doc.indexOf("## צעד 6"), doc.indexOf("## צעד 7"));

  it("never asserts an online filing route for the tax file, and says how reg 2(א)(1) delivers it", () => {
    const timeLine = step2Doc.split("\n").find((l) => l.startsWith("**זמן:"))!;
    expect(timeLine).toBeDefined();
    // The Tax Authority part of the step: the time line and the "what to do" item for רשות המסים.
    const taxItem = step2Doc.slice(step2Doc.indexOf("1. **רשות המסים**"), step2Doc.indexOf("2. **ביטוח לאומי**"));
    expect(timeLine).not.toContain("אונליין");
    expect(taxItem).not.toContain("אונליין");
    // Not only the word: no government-ID login instruction and no leftover of the online clause either.
    expect(timeLine).not.toMatch(/היכנס|ההזדהות הממשלתית/);
    expect(taxItem).not.toMatch(/היכנס|ההזדהות הממשלתית/);
    expect(taxItem).toContain("למסור ביד או דרך רו\"ח/עו\"ד/יועץ מס/מנהל חשבונות");
    expect(taxItem).toContain("מסלול מקוון לא אומת מכאן");
    expect(timeLine).toContain("לפי תק' 2(א)(1) שנקראה, הטופס נמסר ביד או דרך רו\"ח/עו\"ד/יועץ מס/מנהל חשבונות");
    expect(timeLine).toContain("מסלול מקוון באתר רשות המסים לא אומת מכאן");
    // Across the whole "what to do" block (ביטוח לאומי included), "אונליין" appears only beside "לא אומת".
    const todo = step2Doc.slice(step2Doc.indexOf("### מה לעשות"), step2Doc.indexOf("### מה זה עושה"));
    const onlineLines = todo.split("\n").filter((l) => l.includes("אונליין"));
    expect(onlineLines.length).toBeGreaterThan(0);
    for (const l of onlineLines) expect(l).toContain("לא אומת");
    // The notice's reg 2(א)(2) is the VAT bookkeeping regulations', not the registration regulations' 2(א)(1).
    expect(step2Doc).toContain("תק' 2(א)(2) לתקנות מע\"מ (ניהול פנקסי חשבונות)");
    expect(ownerStepById("tax-file")!.unlocks).toMatch(/reg 2\(א\)\(2\) of the VAT bookkeeping regulations/);
    expect(ownerStepById("tax-file")!.unlocks).toMatch(/online route on the Tax Authority's site is unverified/);
  });

  it("describes the occupation as the business runs, and has the owner report an עוסק מורשה class in one word", () => {
    expect(step2Doc).toContain(
      "פיתוח והפעלה של כלים דיגיטליים ותוכנה ומכירת רישיונות לשימוש בהם באינטרנט; תמלוגים וחלוקת הכנסות מפלטפורמות מקוונות.",
    );
    expect(step2Doc).toContain("הפעילות מבוצעת על ידי מערכת אוטומטית (סוכני AI) מטעם העסק.");
    expect(step2Doc).toContain("המשרד קובע את הסיווג");
    expect(step2Doc).toContain("לכתוב לי את המילה הזאת עם 'צעד 2 בוצע'");
    expect(step2Doc).not.toContain("פיתוח תוכנה ומכירת כלים דיגיטליים");
    const tax = ownerStepById("tax-file")!.unlocks;
    expect(tax).toMatch(/the office decides the class/);
    expect(tax).toMatch(/עוסק מורשה the owner writes that word with 'צעד 2 בוצע'/);
  });

  it("names the annual declaration and the one-time registered-mail notice, and asks neither", () => {
    expect(step2Doc).not.toMatch(/דיווח \*\*פעם בשנה\*\*/);
    expect(step2Doc).toContain("הצהרת מחזור שנתית עד 31 בינואר");
    // Reg 22(2) of the general VAT regulations, read 30.9 at github grade from the lawsofisrael mirror (a 2023 text);
    // it names "עוסק זעיר הפטור ממס לפי סעיף 31(3)", and §31(3) now reads "עסקאות של עוסק פטור" — hence the inference
    // (research/measurements/osek-patur-documents.md, "30.9 (tick 26, github)" §2).
    expect(step2Doc).toContain(
      "הפטור מדיווח תקופתי הוא תק' 22(2) לתקנות מע\"מ הכלליות (נוסח 2023 שנקרא ב-GitHub), והיא חלה על עוסק פטור בהסקה דרך §31(3)",
    );
    expect(step2Doc).not.toContain("יושב בתקנות הכלליות שעוד לא נקראו");
    const what = step2Doc.slice(step2Doc.indexOf("### מה זה עושה"), step2Doc.indexOf("### מה יוצא לך מזה"));
    expect(what).toContain("המכונה מחשבת את הסכום מהלדג'ר ומכינה את הטופס");
    expect(what).toContain("הודעה חד-פעמית בדואר רשום");
    expect(what).toContain("עלות הדואר הרשום עוד לא נבדקה, ולכן היא עוד לא מבוקשת");
    expect(step2Doc).toContain("המסמך הראשון יוצא רק אחרי שנסגרה שאלת החתימה");
    expect(step2Doc).toContain("RULING-2026-09-30-documents.md");
    const tax = ownerStepById("tax-file")!.unlocks;
    expect(tax).toMatch(/annual turnover declaration by 31 January \(reg 15\)/);
    expect(tax).toContain(
      "The exemption from periodic reports is reg 22(2) of the general VAT regulations (a 2023 text read on GitHub), which reaches the exempt dealer by inference through §31(3).",
    );
    expect(tax).not.toMatch(/general VAT regulations, still unread/);
    expect(tax).toMatch(/one-time registered-mail notice[^.]*recorded and not asked while the cost of registered mail is unchecked/);
    expect(tax).toMatch(/the first document goes out only after the signature question is closed/);
  });

  it("tells step 3 to leave Gumroad's Support email blank or on the brand mailbox, and to name the account Mehudak", () => {
    const todo = step3Doc.slice(step3Doc.indexOf("### מה לעשות"), step3Doc.indexOf("### מה זה עושה"));
    expect(todo).toContain("הגדרות → Support → Email: להשאיר ריק או לשים את תיבת המותג; לא להגדיר כתובת תמיכה למוצר");
    expect(todo).toContain("שם החשבון (name) = Mehudak");
    // A field holding the brand mailbox is allowed, so only a different address diverts receipt replies.
    expect(todo).toContain("כשבשדה כתובת אחרת, תשובות הקונים לקבלה הולכות אליה ולא לתיבה שהמכונה קוראת");
    expect(todo).not.toContain("כשהשדה מלא");
    const gumroad = ownerStepById("gumroad")!.unlocks;
    expect(gumroad).toMatch(/Settings → Support → Email blank or sets it to the brand mailbox/);
    expect(gumroad).toMatch(/names the account \(name\) Mehudak/);
  });

  it("adds POSTHOG_READ_KEY as step 6's last row, held until the brand's PostHog project exists", () => {
    const step6 = ownerStepById("ci-tokens")!;
    // ORG_BUDGETS_READ_TOKEN joined after BRAND_GITHUB_TOKEN on 4.10 (RULING-2026-10-04-mozilla-precondition.md §2).
    expect(step6.secrets!.map((r) => r.name)).toEqual([
      "GUMROAD_ACCESS_TOKEN", "APIFY_TOKEN", "BRAND_GITHUB_TOKEN", "ORG_BUDGETS_READ_TOKEN", "POSTHOG_READ_KEY",
    ]);
    const key = step6.secrets!.find((r) => r.name === "POSTHOG_READ_KEY")!;
    expect(key.source).toMatch(/'Performing analytics queries' scope only/);
    expect(key.askedOnlyWhen).toBe("posthog-project-exists");
    // Only the new row is gated; the other three are asked as before.
    expect(step6.secrets!.filter((r) => r.askedOnlyWhen).map((r) => r.name)).toEqual(["POSTHOG_READ_KEY"]);
    // The gate: never asked while posthog.projectId is empty, asked once the colony has written it.
    expect(isSecretRowAsked(key, { projectId: "" })).toBe(false);
    expect(isSecretRowAsked(key, { projectId: "   " })).toBe(false);
    expect(isSecretRowAsked(key, { projectId: "12345" })).toBe(true);
    expect(askedSecretRows(step6, { projectId: "" }).map((r) => r.name)).toEqual([
      "GUMROAD_ACCESS_TOKEN", "APIFY_TOKEN", "BRAND_GITHUB_TOKEN", "ORG_BUDGETS_READ_TOKEN",
    ]);
    expect(askedSecretRows(step6, { projectId: "12345" }).map((r) => r.name)).toContain("POSTHOG_READ_KEY");
    expect(heldSecretRows(step6, { projectId: "" }).map((r) => r.name)).toEqual(["POSTHOG_READ_KEY"]);
    expect(heldSecretRows(step6, { projectId: "12345" })).toEqual([]);
    // The gate reads the same field the page-view reader reads, from the real site.json.
    const site = readSite();
    expect(isSecretRowAsked(key, site)).toBe(site.projectId !== "");
    // No other step has secret rows.
    expect(OWNER_STEPS.filter((s) => s.secrets).map((s) => s.id)).toEqual(["ci-tokens"]);
    expect(step6.unlocks).toMatch(/POSTHOG_READ_KEY/);
    expect(step6.unlocks).toMatch(/only after the agent has created the brand's PostHog project and written its id to site\.json/);
  });

  it("carries the same secret rows in the Hebrew table, in the same order, and says the new one waits for the project", () => {
    const names = [...step6Doc.matchAll(/^\s*\| `([A-Z_]+)` \|/gm)].map((m) => m[1]);
    expect(names).toEqual(ownerStepById("ci-tokens")!.secrets!.map((r) => r.name));
    const row = step6Doc.split("\n").find((l) => l.includes("| `POSTHOG_READ_KEY` |"))!;
    expect(row).toContain("מפתח API אישי ב-PostHog עם ההרשאה 'Performing analytics queries' בלבד, בחשבון שבו הפרויקט של המותג");
    expect(row).toContain("מפעיל את קורא הצפיות השבועי; בלעדיו שער ה-PASS של Pro לא נקרא לעולם");
    expect(row).toContain("נשאל רק אחרי שהפרויקט קיים");
    expect(row).toContain("`posthog.projectId`");
    expect(row).toContain("RULING-2026-09-30-documents.md");
  });

  // Ruling 7.10 (research/channel-loop/RULING-2026-10-07-posthog-organisation.md §1-§2): the PostHog organisation click is
  // not a ninth step but part ד of step 6, two free organisations (the brand, the T1 sub-brand) inside the login the
  // connector already reaches. Its stop rules are printed in the Hebrew part, not in `stopIf` (step 4 alone has one).
  it("puts part ד, two PostHog organisations, inside step 6 with its time and its stop rule (ruling 7.10)", () => {
    const step6 = ownerStepById("ci-tokens")!;
    expect(step6.minutes).toEqual([18, 23]);
    expect(step6.unlocks).toMatch(/two PostHog organisations/);
    expect(step6Doc).toContain("### חלק ד");
    expect(step6Doc).toContain("עצור אם");
  });

  // Tick 62 (7.10.2026): the hourly report prints the lines' setup items, and none named PostHog, so part ד was asked
  // nowhere in it. il-biz-tools now carries it as its second item, after the mailbox and before Gumroad (the ₪0 order).
  it("asks part ד in the report: il-biz-tools' second setup item is the two PostHog organisations, linked to step 6", () => {
    const items = DEFAULT_PORTFOLIO.find((l) => l.id === "il-biz-tools")!.humanSetupItems!;
    expect(items.map((i) => i.steps)).toEqual([[8], [6], [3], [6]]);
    const ph = items[1];
    expect(ph.text).toMatch(/^Create two PostHog organisations, Mehudak and chartsplained, in the PostHog login the connector already reaches/);
    expect(ph.text).toContain("(owner step 6 part ד)");
    expect(ph.text).toContain("about 3 minutes, free, no card and no identity");
    expect(ph.text).toContain("close the tab and create nothing");
    expect(ph.text).toContain("Without them no page-view counter runs and no D0 is recorded");
    expect(ph.text).toContain("ruling 7.10 row 25");
    expect(ph.contextSteps).toBeUndefined();
    // Exactly one item names PostHog, and it never asks for the key, which waits for the project (the held-row note).
    const all = DEFAULT_PORTFOLIO.flatMap((l) => l.humanSetupItems ?? []);
    expect(all.filter((i) => /PostHog/.test(i.text))).toEqual([ph]);
    expect(ph.text).not.toContain("POSTHOG_READ_KEY");
  });
});

// Open from the tick-26 builds (logs/CHANNEL_LOOP.md §9): a step marked done while its gated row was still held back
// took the row with it. askedSecretRows/heldSecretRows only ever ran on open steps, so POSTHOG_READ_KEY was never asked
// once the project existed, and the runner raised it only as a blocker once a page-view clock ran.
describe("a gated row held back when its step was done is asked alone later, as a follow-up", () => {
  const step6 = ownerStepById("ci-tokens")!;
  type Done = NonNullable<typeof step6.doneOn>;
  const doneWith = (doneOn: Done, rowDone = false) => [{
    ...step6,
    doneOn,
    secrets: step6.secrets!.map((r) =>
      rowDone && r.name === "POSTHOG_READ_KEY" ? { ...r, doneOn: { date: "2026-10-09", evidence: "test only" } } : r,
    ),
  }];
  const held: Done = { date: "2026-10-02", evidence: "test only", heldRows: ["POSTHOG_READ_KEY"] };
  const names = (rows: { step: { number: number }; row: { name: string } }[]) =>
    rows.map(({ step, row }) => `${step.number}:${row.name}`);

  it("asks the held row alone once its gate holds, and names it held until then", () => {
    const steps = doneWith(held);
    expect(isOwnerStepOpen(steps[0])).toBe(false);
    expect(names(followUpSecretRows({ projectId: "" }, steps))).toEqual([]);
    expect(names(heldFollowUpSecretRows({ projectId: "" }, steps))).toEqual(["6:POSTHOG_READ_KEY"]);
    expect(names(followUpSecretRows({ projectId: "12345" }, steps))).toEqual(["6:POSTHOG_READ_KEY"]);
    expect(names(heldFollowUpSecretRows({ projectId: "12345" }, steps))).toEqual([]);
  });

  it("stops asking once the row records its own doneOn", () => {
    const steps = doneWith(held, true);
    expect(followUpSecretRows({ projectId: "12345" }, steps)).toEqual([]);
    expect(heldFollowUpSecretRows({ projectId: "" }, steps)).toEqual([]);
  });

  it("asks nothing again when the row was pasted with its step (heldRows empty)", () => {
    const steps = doneWith({ date: "2026-10-02", evidence: "test only", heldRows: [] });
    expect(followUpSecretRows({ projectId: "12345" }, steps)).toEqual([]);
    expect(heldFollowUpSecretRows({ projectId: "" }, steps)).toEqual([]);
  });

  it("leaves an open step's rows to the step itself: no follow-up while the step is still asked", () => {
    expect(followUpSecretRows({ projectId: "12345" }, [step6])).toEqual([]);
    expect(heldFollowUpSecretRows({ projectId: "" }, [step6])).toEqual([]);
  });

  it("makes every done step with a gated row say which gated rows it held back, and never a row that is not gated", () => {
    // The record is required, so marking step 6 done forces the choice; a missing heldRows would lose the row again.
    for (const step of OWNER_STEPS.filter((s) => s.doneOn && s.secrets?.some((r) => r.askedOnlyWhen))) {
      expect(Array.isArray(step.doneOn!.heldRows), `step ${step.number} doneOn.heldRows`).toBe(true);
      const gated = step.secrets!.filter((r) => r.askedOnlyWhen).map((r) => r.name);
      for (const name of step.doneOn!.heldRows!) expect(gated, `step ${step.number} heldRows`).toContain(name);
    }
    for (const step of OWNER_STEPS.filter((s) => s.doneOn?.heldRows)) {
      expect(step.secrets?.some((r) => r.askedOnlyWhen), `step ${step.number} has no gated row to hold`).toBe(true);
    }
    // A row today's site.json still holds back cannot have been pasted with a done step: it must be listed as held.
    const site = readSite();
    for (const step of OWNER_STEPS.filter((s) => s.doneOn)) {
      for (const row of heldSecretRows(step, site)) {
        expect(step.doneOn!.heldRows ?? [], `step ${step.number} is done while ${row.name} is still held`).toContain(row.name);
      }
    }
  });

  it("tells the owner in the Hebrew row that a done step 6 gets this row alone later", () => {
    const step6Doc = doc.slice(doc.indexOf("## צעד 6"), doc.indexOf("## צעד 7"));
    const row = step6Doc.split("\n").find((l) => l.includes("| `POSTHOG_READ_KEY` |"))!;
    expect(row).toContain("אם צעד 6 כבר בוצע עד אז, השורה הזאת לבדה נשאלת אחר כך, כהשלמה");
  });
});

/**
 * Ruling of 4.10.2026 on Mozilla's precondition (research/channel-loop/RULING-2026-10-04-mozilla-precondition.md §2
 * rule 3; fold action 7). Step 7's sitting gains the organisation's ₪0 fence for the open repo-visibility decision —
 * a $0 Actions product-level budget on the whole organisation that stops usage, created before any private repository
 * exists there, the included-usage alerts, and a read-only token — with Mozilla named only as one line that would use
 * it. No step is added; the token is a step-6 row made in step 7's sitting.
 */
describe("step 7 carries the organisation's ₪0 fence (ruling 4.10, row 18)", () => {
  const step7 = ownerStepById("github-org")!;
  const step7Doc = doc.slice(doc.indexOf("## צעד 7"), doc.indexOf("## צעד 8"));
  const fence = step7Doc.slice(step7Doc.indexOf("8. **גדר ה-0 ₪ של הארגון"), step7Doc.indexOf("### מה זה עושה"));

  it("keeps eight steps and puts the fence inside step 7's sitting, with its time", () => {
    expect(OWNER_STEPS).toHaveLength(8);
    expect(step7.minutes).toEqual([15, 20]);
    expect(step7Doc).toMatch(/^\*\*זמן: 15–20 דקות\*\*/m);
    const table = doc.slice(doc.indexOf("## סיכום בטבלה אחת"));
    expect(table).toMatch(/^\| 7 \| [^\n]*תקציב Actions של \$0[^\n]*\| 15–20 \|/m);
  });

  it("states the fence in code as the ruling words it: $0, Actions, whole organisation, stop usage, before any private repo", () => {
    const u = step7.unlocks;
    expect(u).toContain("₪0 fence for the open repo-visibility decision");
    expect(u).toContain("$0 Actions product-level budget scoped to the whole organisation");
    expect(u).toContain('"Stop usage when budget limit is reached" ticked');
    expect(u).toContain("created before any private repository exists in the organisation");
    expect(u).toContain("included-usage alerts");
    expect(u).toContain("Administration: read only");
    // The token's shape, as the ruling's amendment of 4.10 sets it: the owner's own PAT; never the machine account's.
    expect(u).toContain(
      "a fine-grained personal access token of the owner's own account, with the organisation as resource owner, Administration: read only and the longest expiry GitHub offers",
    );
    expect(u).toContain("Never Administration: write");
    expect(u).toContain("The machine account is never made a billing manager");
    // Mozilla is one user of the fence, not its reason, and asks for nothing of its own.
    expect(u).toMatch(/Mozilla's dry-run harness \(loop row 8\) is one line that would use the fence/);
    expect(u).toContain("RULING-2026-10-04-mozilla-precondition.md");
    // The step's earlier text stands.
    expect(u).toMatch(/same sitting/);
    expect(u).toMatch(/BRAND_GITHUB_TOKEN/);
  });

  // Tick 62 (7.10.2026): oss-bounties' setup item, which the hourly report prints, still called BRAND_GITHUB_TOKEN "the
  // only other thing step 7's sitting does" after the fence joined the sitting on 4.10. It now names the fence.
  it("names the fence in oss-bounties' setup item too, in step 7's own words, not the token alone", () => {
    const machine = DEFAULT_PORTFOLIO.find((l) => l.id === "oss-bounties")!.humanSetupItems![0];
    expect(machine.text).not.toContain("the only other thing step 7's sitting does");
    expect(machine.text).toContain("the same sitting also sets the organisation's $0 Actions budget");
    expect(machine.text).toContain('"Stop usage when budget limit is reached" ticked');
    expect(machine.text).toContain("opts in to the included-usage alerts");
    expect(machine.text).toContain("creates the read-only ORG_BUDGETS_READ_TOKEN");
    expect(machine.text).toContain("ruling 4.10 row 18 and its amendment");
    for (const words of ['"Stop usage when budget limit is reached" ticked', "included-usage alerts", "ORG_BUDGETS_READ_TOKEN"]) {
      expect(step7.unlocks, `step 7's own words: ${words}`).toContain(words);
    }
    expect(machine.text).not.toMatch(/write/i);
  });

  it("writes the fence in the Hebrew step 7: the five by-sight items, the alerts, the stop rule and the token", () => {
    expect(fence.length).toBeGreaterThan(500);
    expect(fence).toContain("**Product-level budget**, והמוצר **Actions**");
    expect(fence).toContain("**Budget scope:** **Organization**");
    expect(fence).toContain("`0` (כלומר $0)");
    expect(fence).toContain("**Stop usage when budget limit is reached**");
    expect(fence).toMatch(/\*\*לפני\*\* שיש בארגון ריפו פרטי כלשהו/);
    expect(fence).toContain("**Included usage alerts**");
    expect(fence).toMatch(/\*\*לעצור אם\*\* אין שם תקציב Actions/);
    // The framing: the organisation's fence for the open decision; Mozilla only one line that would use it.
    expect(fence).toContain("להחלטה שעוד פתוחה, אם להפוך את הריפו לפרטי");
    expect(fence).toContain("קו Mozilla (שורה 8 בלופ) הוא רק אחד הקווים שישתמשו בגדר");
    // The token (the amendment of 4.10, shape B): never the machine account as billing manager, the role's list as the
    // reason, organisation as resource owner, read only, no shape-A fallback, never write.
    expect(fence).toContain("**חשבון המכונה לא נעשה אף פעם מנהל חיוב (billing manager) של הארגון**");
    expect(fence).toContain("**מה התפקיד הזה יכול (הרשימה של GitHub עצמה):**");
    expect(fence).toContain("`ORG_BUDGETS_READ_TOKEN`");
    expect(fence).toMatch(/\*\*Administration\*\* \(בהרשאות הארגון\) ברמת \*\*קריאה בלבד\*\*/);
    expect(fence).not.toContain("**אם GitHub מסרב**");
    expect(fence).toContain("**אף פעם לא Administration ברמת כתיבה (write):**");
    // Rendered sources, cited by their frozen copies only.
    expect(fence).toContain("gh-docs-set-up-budgets-2026-09-29.txt:");
    expect(fence).toContain("gh-docs-budgets-and-alerts-2026-09-29.txt:");
    expect(fence).toContain("gh-docs-rest-billing-budgets-2026-09-29.txt:504");
    expect(fence).not.toMatch(/gh-docs-[a-z-]+\.txt:/);
  });

  it("says what a billing manager is able to do from lines that say it", () => {
    const line = (slug: string, n: number) =>
      fs.readFileSync(path.join(repoRoot, `research/rendered/${slug}.txt`), "utf8").split("\n")[n - 1];
    expect(line("gh-docs-set-up-budgets-2026-09-29", 279)).toMatch(/billing manager, any account-level budget is listed/);
    expect(line("gh-docs-set-up-budgets-2026-09-29", 295)).toMatch(/or as a billing manager, you can set a budget at the account level/);
    expect(line("gh-docs-budgets-and-alerts-2026-09-29", 239)).toMatch(/alerts go to account owners and billing managers/);
    expect(line("gh-docs-budgets-and-alerts-2026-09-29", 269)).toMatch(/billing managers can opt in or out of these notifications/);
    expect(line("gh-docs-rest-billing-budgets-2026-09-29", 504)).toMatch(/must be an organization admin or billing manager/);
    // The power the summary must not leave out: the organisation section (:259) that names billing managers (:295) says a
    // budget can be edited or deleted at any time, so the role's own session can remove the $0 fence.
    expect(line("gh-docs-set-up-budgets-2026-09-29", 259)).toBe("Managing budgets for your organization or enterprise");
    expect(line("gh-docs-set-up-budgets-2026-09-29", 355)).toBe("Editing or deleting a budget");
    expect(line("gh-docs-set-up-budgets-2026-09-29", 361)).toMatch(/^You can edit or delete a budget at any time/);
  });

  /**
   * Ruling 4.10 §2 rule 3 and "Not ruled here" item 3: before the owner page names the billing-manager role, a runner
   * reads what that role is able to do, from github/docs' adding-a-billing-manager-to-your-organization.md (BM), and
   * summarises it in one line. BM's "Billing managers can:" (BM:22-24) is an include,
   * data/reusables/billing/org-billing-manager-permissions.md, read 4.10 from github/docs at github grade (the note's
   * "The billing-manager line" key table). It gives the role three ways to spend money — payment methods, the plan,
   * sponsorships — and the ruling's amendment of 4.10 (~09:00 UTC, main thread on Fable) withdrew shape A on that list:
   * the machine account is never made a billing manager, and the token is the owner's own fine-grained PAT (shape B).
   * The role's line stays only as the reason the role is not granted, and item 9 is asked with the sitting, no hold.
   */
  it("asks item 9 as shape B, the owner's own token, and never makes the machine account a billing manager", () => {
    const item9 = fence.slice(fence.indexOf("9. **טוקן לקריאה בלבד של התקציב**"));
    expect(item9.length).toBeGreaterThan(300);
    // The hold is lifted: the item is asked with the rest of the sitting.
    expect(item9).not.toContain("⏸");
    expect(item9).not.toMatch(/מחכה להחלטה|לדלג עליו|עד שאכתוב/);
    // Shape B, as the amendment words it: the owner's own account, the organisation as resource owner, one permission
    // at read, the longest expiry, the name; the token-policy switch in the same sitting; renewal with BRAND_GITHUB_TOKEN.
    expect(item9).toMatch(/\*\*הטוקן יוצא מהחשבון האישי של הבעלים,\s+לא מחשבון המכונה\*\*/);
    expect(item9).toContain("בחשבון **האישי** של הבעלים (לא בחשבון המכונה)");
    expect(item9).toContain("**Resource owner** — הארגון `mehudak`");
    expect(item9).toMatch(/\*\*Expiration\*\* — התוקף\s+הארוך ביותר ש-GitHub מציע/);
    expect(item9).toMatch(/הרשאה אחת בלבד — \*\*Administration\*\* \(בהרשאות הארגון\) ברמת \*\*קריאה בלבד\*\* \(read\)/);
    expect(item9).toContain("לשמור אותו בצד בשם `ORG_BUDGETS_READ_TOKEN`");
    expect(item9).toContain("אם מדיניות הטוקנים של הארגון לא מאפשרת fine-grained tokens");
    expect(item9).toContain("— חלק מאותה ישיבה");
    expect(item9).toContain("מחדשים אותו באותו רגע שבו מחדשים את `BRAND_GITHUB_TOKEN` — אף פעם לא כפעולה נפרדת");
    expect(item9).toContain("RULING-2026-10-04-mozilla-precondition.md");
    // Why the role is not granted, in one clause, then the role's own list as the evidence.
    expect(item9).toContain("**חשבון המכונה לא נעשה אף פעם מנהל חיוב (billing manager) של הארגון**");
    expect(item9).toMatch(/כי התפקיד הזה יכול להוסיף אמצעי תשלום\s+ולשנות את המסלול/);
    expect(item9).toContain("החשיפה היא התפקיד");
    expect(item9).toContain("**מה התפקיד הזה יכול (הרשימה של GitHub עצמה):**");
    expect(item9).toContain("**להוסיף, לעדכן ולהסיר אמצעי תשלום**");
    expect(item9).toContain("**להעביר את הארגון בין Free ל-Team**");
    expect(item9).toContain("**להתחיל, לשנות ולבטל חסויות (sponsorships)**");
    expect(item9).toMatch(/\*\*לערוך ולמחוק\*\* תקציב — כלומר ייתכן שגם את גדר ה-\$0, מה שהטוקן לקריאה בלבד לא יכול/);
    expect(item9).toContain("`data/reusables/billing/org-billing-manager-permissions.md`, sha256 `bd7467c0b55f`");
    expect(item9).toContain("sha256 `97ea127f989c`");
    expect(item9).toMatch(/`gh-docs-set-up-budgets-2026-09-29\.txt:279`,\s+`:295`, `:361`/);
    // The old line cited BM for powers BM's own lines do not state.
    expect(item9).not.toContain("**מה התפקיד הזה יכול:**");
    // No instruction anywhere in the document makes the machine account a billing manager (shape A, withdrawn): no
    // verb granting the role to it, no invite path, no token "of the machine account" for the budgets, no fallback.
    const grant = /(להוסיף|להזמין|לתת|לעשות|למנות|לצרף)[^.\n]{0,80}(`mehudak-ci`|חשבון המכונה)[^.\n]{0,80}מנהלי? חיוב/;
    expect(doc).not.toMatch(grant);
    expect("להוסיף את `mehudak-ci` גם כ**מנהל חיוב (billing manager)**").toMatch(grant); // the withdrawn line
    expect(doc).not.toMatch(/כ\*\*מנהל חיוב/);
    expect(doc).not.toContain('ליד "Billing managers", **Invite**');
    expect(item9).not.toMatch(/בחשבון המכונה, Developer settings|\*\*אם GitHub מסרב\*\*/);
    // The code says the same: shape B, the reason, the three money powers quoted from the include, no hold.
    const u = step7.unlocks;
    expect(u).not.toContain("held, not asked");
    expect(u).not.toMatch(/machine account is made a billing manager|as billing manager|if GitHub refuses/);
    expect(u).toContain("The machine account is never made a billing manager: the role can add payment methods and change the plan");
    expect(u).toContain("which withdrew shape A");
    expect(u).toContain("the organisation's token policy must first allow fine-grained tokens, that switch is part of the same sitting");
    expect(u).toContain("the token is renewed when BRAND_GITHUB_TOKEN is, never as an action of its own");
    expect(u).toContain("data/reusables/billing/org-billing-manager-permissions.md");
    expect(u).toContain('"Add, update, or remove payment methods."');
    expect(u).toContain('"Start, modify, or cancel sponsorships."');
    expect(u).toContain('"Upgrade or downgrade between" the Free and Team plans');
    expect(u).toContain("gh-docs-set-up-budgets-2026-09-29.txt:361");
    expect(u).toContain("the role's own session may be able to remove the $0 fence, which the read-only token cannot");
    // The step-6 row, step 6's text and the 4.10 summary say shape B, and none still points at a hold.
    const row = doc.split("\n").find((l) => l.includes("| `ORG_BUDGETS_READ_TOKEN` |"))!;
    expect(row).toContain("**מהחשבון האישי של הבעלים** ולא מחשבון המכונה");
    expect(row).not.toContain("מחכה להחלטה");
    const summary = doc.slice(doc.indexOf("**עודכן 4.10.2026"), doc.indexOf("> ### כלל ה-0 ₪ (27.9)"));
    expect(summary).toContain("מהחשבון האישי של הבעלים");
    expect(summary).toContain("חשבון המכונה לא נעשה מנהל חיוב");
    expect(summary).not.toContain("מחכה להחלטה");
    const step6 = ownerStepById("ci-tokens")!;
    const source = step6.secrets!.find((r) => r.name === "ORG_BUDGETS_READ_TOKEN")!.source;
    expect(source).toContain("of the owner's own account (never the machine account's)");
    expect(source).toContain("the longest expiry GitHub offers");
    expect(source).not.toMatch(/billing manager|held/);
    expect(step6.unlocks).toContain("it is the owner's own fine-grained token, never the machine account's");
    expect(step6.unlocks).not.toContain("held on one decision");
    // The note records the read (both files' hashes and the list) and that the shape question is closed.
    const note = fs.readFileSync(path.join(repoRoot, "research/measurements/actions-spending-limit.md"), "utf8");
    const section = note.slice(note.indexOf("### The billing-manager line"));
    expect(section).toContain("97ea127f989c88607e83425ad0ec0c098d212e283b55149aea95281016d23c9b");
    expect(section).toContain("bd7467c0b55f683a120b073099ae8f8c03761e81d45df9cad5c3c684aab47065");
    expect(section).toContain("78141f05f6b3cd7aa7f198b50ffc3c60338467fd");
    expect(section).toContain("* Add, update, or remove payment methods.");
    expect(section).toContain("the shape question is closed, shape B");
    // The amendment the fold applies stands at the end of the ruling.
    const ruling = fs.readFileSync(path.join(repoRoot, "research/channel-loop/RULING-2026-10-04-mozilla-precondition.md"), "utf8");
    const amendment = ruling.slice(ruling.indexOf("## Amendment (4.10, ~09:00 UTC, main thread on Fable 5.1): the token's shape"));
    expect(amendment).toContain("1. Shape A is withdrawn. The machine account is never made a billing manager");
    expect(amendment).toContain("2. Shape B is the only shape");
    expect(amendment).toContain("3. Item 9's hold is lifted by this text.");
  });

  it("pins read-only on the token wherever it is written, not only in step 7's text", () => {
    const step6 = ownerStepById("ci-tokens")!;
    const source = step6.secrets!.find((r) => r.name === "ORG_BUDGETS_READ_TOKEN")!.source;
    expect(source).toContain("Administration: read only");
    expect(source).not.toMatch(/write/i);
    const u6 = step6.unlocks.slice(step6.unlocks.indexOf("ORG_BUDGETS_READ_TOKEN"), step6.unlocks.indexOf("POSTHOG_READ_KEY"));
    expect(u6).toContain("Administration: read on the organisation, nothing else");
    expect(u6).not.toMatch(/write/i);
    const row = doc.split("\n").find((l) => l.includes("| `ORG_BUDGETS_READ_TOKEN` |"))!;
    expect(row).toContain("Administration ברמת קריאה בלבד");
    expect(row).not.toMatch(/כתיבה|write/i);
  });

  it("says in step 4 that the second token comes from the owner's own account, not the machine account (shape B)", () => {
    const step4Doc = doc.slice(doc.indexOf("## צעד 4"), doc.indexOf("## צעד 5"));
    const note = step4Doc.slice(step4Doc.indexOf("(מאז 4.10"), step4Doc.indexOf("סעיף 9.)") + "סעיף 9.)".length);
    expect(note.length).toBeGreaterThan(50);
    expect(note).toContain("נוצר באותה ישיבה גם טוקן");
    expect(note).toMatch(/`ORG_BUDGETS_READ_TOKEN` — מהחשבון האישי של הבעלים, לא מחשבון המכונה;\s+פירוט בצעד 7, סעיף 9\.\)/);
    expect(note).not.toContain("ואם GitHub מסרב");
    expect(note).not.toContain("יוצא ממנו");
  });

  it("promises the fence's effects only as conditional and future: by-sight items (3)-(4) may fail, the read is not built", () => {
    const got = step7Doc.slice(step7Doc.indexOf("### מה יוצא לך מזה"));
    const fenceGot = got.slice(got.indexOf("וגדר ה-0 ₪ (סעיפים 8–9)"));
    expect(fenceGot.length).toBeGreaterThan(100);
    expect(fenceGot).toMatch(/אם העמוד מקבל \$0 ומציע עצירה, שימוש בתשלום\s+ב-Actions נעצר/);
    expect(fenceGot).toMatch(/והבדיקה, כשתיבנה אחרי צעד 7, קוראת את הגדר לפני הדקה הראשונה שעלולה\s+לעלות כסף/);
    expect(fenceGot).toMatch(/"פרטי" אפשר לבחור רק אחרי שהיא קראה אותה/);
    expect(fenceGot).not.toContain("ומכונה בודקת");
    // Item 9's purpose and the step-6 row promise the ruling's read (before the first metered-capable minute), not more.
    expect(fence).toContain("כדי שהבדיקה, כשתיבנה אחרי צעד 7, תוכל לקרוא שהגדר באמת קיימת לפני הדקה הראשונה");
    expect(fence).not.toContain("לפני כל דקה");
    const row = doc.split("\n").find((l) => l.includes("| `ORG_BUDGETS_READ_TOKEN` |"))!;
    expect(row).toContain("היא תקרא את התקציב לפני הדקה הראשונה שעלולה לעלות כסף");
    expect(row).not.toContain("לפני כל עבודה");
    // The summary table's step-7 row says the same.
    const row7 = doc.slice(doc.indexOf("## סיכום בטבלה אחת")).split("\n").find((l) => l.startsWith("| 7 |"))!;
    expect(row7).toContain("אם העמוד מקבל $0 ומציע עצירה, שימוש בתשלום ב-Actions נעצר בגבול");
  });

  /**
   * The steps are written in infinitive or impersonal forms, and the owner is "הבעלים". A fixed word list missed
   * "תאשר" (review R2), so the second-person future forms are derived from every infinitive the 4.10 text itself uses:
   * ל+X gives תX, תXי and the feminine with X's last ו/י dropped (לכתוב → תכתוב, תכתבי); לה+X gives תX (להוסיף →
   * תוסיף). A third-person feminine future is spelled like the second masculine, so a sentence whose subject is "הבדיקה"
   * is written in the present instead.
   */
  it("adds no gendered singular to the owner's new lines (infinitive or impersonal forms, as the steps are written)", () => {
    const step4Doc = doc.slice(doc.indexOf("## צעד 4"), doc.indexOf("## צעד 5"));
    const got = step7Doc.slice(step7Doc.indexOf("### מה יוצא לך מזה"));
    const added = [
      fence,
      doc.slice(doc.indexOf("**עודכן 4.10.2026"), doc.indexOf("> ### כלל ה-0 ₪ (27.9)")),
      step4Doc.slice(step4Doc.indexOf("(מאז 4.10"), step4Doc.indexOf("סעיף 9.)")),
      doc.split("\n").find((l) => l.includes("| `ORG_BUDGETS_READ_TOKEN` |"))!,
      got.slice(got.indexOf("וגדר ה-0 ₪ (סעיפים 8–9)")),
      doc.split("\n").find((l) => l.startsWith("| 7 |"))!,
    ].join("\n");
    expect(added.length).toBeGreaterThan(2000);
    const words = new Set(added.split(/[\s,.;:()*"`'—–\-?!/[\]|]+/).filter(Boolean));
    const HEB = /^[\u05d0-\u05ea]+$/;
    const derive = (ws: Iterable<string>) =>
      [...ws]
        .filter((w) => HEB.test(w) && w.length >= 4 && w.startsWith("ל"))
        .flatMap((w) => [w.slice(1), ...(w.startsWith("לה") ? [w.slice(2)] : [])])
        .flatMap((x) => [`ת${x}`, `ת${x}י`, `ת${x.replace(/[וי](?=[\u05d0-\u05ea]$)/, "")}י`]);
    // The form review R2 slipped past the old list. Its infinitive, "לאשר", left the text with shape A's lines (the
    // amendment of 4.10), so the derivation is checked on it directly; and on two infinitives the text still uses, so an
    // empty read of the text cannot pass.
    expect(derive(["לאשר"])).toContain("תאשר");
    expect(derive(["לשמור", "להוסיף"])).toEqual(expect.arrayContaining(["תשמור", "תשמרי", "תוסיף"]));
    const derived = derive(words);
    expect(derived).toEqual(expect.arrayContaining(["תשמור", "תוסיף"]));
    const FIXED = ["אתה", "סמן", "צור", "כתוב", "הוסף", "שמור", "אשר", "בעל"];
    const found = [...new Set([...derived, ...FIXED])].filter((w) => words.has(w));
    expect(found).toEqual([]);
  });
});
