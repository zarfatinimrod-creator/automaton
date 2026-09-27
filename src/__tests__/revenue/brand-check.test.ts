import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
// @ts-expect-error — plain ESM script, no type declarations by design (same as apify-runs.mjs)
import { lookups, parseCandidates, summarise, verdictOf } from "../../../scripts/brand-check.mjs";

/** research/measurements/brand-name-check.md: a name is offered to the owner only after a runner found it free. */
describe("brand-check", () => {
  it("reads the committed candidate list", () => {
    const names = parseCandidates(readFileSync("research/measurements/brand-candidates.txt", "utf8"));
    expect(names.length).toBeGreaterThan(5);
    expect(names).not.toContain("bediyuk");
  });

  it("refuses a name no registry takes, and a duplicate", () => {
    expect(() => parseCandidates("Good\nbad name")).toThrow(/line 2/);
    expect(() => parseCandidates("naki\nnaki")).toThrow(/twice/);
    expect(parseCandidates("# c\nNaki  # clean\n\n")).toEqual(["naki"]);
  });

  it("asks the three registries at their own lookup URLs", () => {
    expect(lookups("naki")).toEqual({
      com: "https://rdap.verisign.com/com/v1/domain/naki.com",
      github: "https://api.github.com/users/naki",
      youtube: "https://www.youtube.com/@naki",
    });
  });

  it("calls a name free only on a 404 from all three; a refusal is unknown, not free", () => {
    expect([verdictOf(404), verdictOf(200), verdictOf(403), verdictOf("error: timeout")]).toEqual(["free", "taken", "unknown", "unknown"]);
    const row = (name: string, com: string, github: string, youtube: string) => ({
      name,
      com: { verdict: com },
      github: { verdict: github },
      youtube: { verdict: youtube },
    });
    expect(summarise([row("a", "free", "free", "free"), row("b", "free", "taken", "free"), row("c", "free", "unknown", "free")])).toEqual({
      allFree: ["a"],
      unknown: ["c"],
    });
  });
});
