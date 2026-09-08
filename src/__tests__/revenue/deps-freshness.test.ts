import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design
import { assessPackage, collectDeps, floorVersion, majorOf, PACKAGE_QUIET_DAYS } from "../../../scripts/check-deps-freshness.mjs";

const DAY = 86_400_000;
/** The day the x402 pin was found by hand, so the fixtures below are the real dates. */
const NOW = Date.parse("2026-09-04T06:00:00Z");
const daysAgo = (n: number) => NOW - n * DAY;

describe("floorVersion", () => {
  it("resolves the version a range floors at", () => {
    expect(floorVersion("1.2.0")).toBe("1.2.0");
    expect(floorVersion("^5.7.0")).toBe("5.7.0");
    expect(floorVersion("~22.10.0")).toBe("22.10.0");
    expect(floorVersion(">=2.0.0")).toBe("2.0.0");
  });

  it("refuses ranges that do not name one version", () => {
    expect(floorVersion("*")).toBeNull();
    expect(floorVersion("1.x")).toBeNull();
    expect(floorVersion("workspace:*")).toBeNull();
    expect(floorVersion(undefined as unknown as string)).toBeNull();
  });
});

describe("majorOf", () => {
  it("reads the major, or nothing", () => {
    expect(majorOf("2.25.0")).toBe(2);
    expect(majorOf("22.20.1")).toBe(22);
    expect(majorOf("nonsense")).toBeNull();
  });
});

describe("collectDeps", () => {
  // The regression that matters. x402-express — the dependency this whole script
  // exists because of — is an optionalDependency in products/x402-il-api, so a
  // collector reading only dependencies + devDependencies would have missed the
  // one case it was written to catch.
  it("reads optionalDependencies and peerDependencies, not just the usual two", () => {
    const found = collectDeps({
      dependencies: { express: "4.21.2" },
      devDependencies: { vitest: "4.1.11" },
      optionalDependencies: { "x402-express": "1.2.0" },
      peerDependencies: { "@x402/paywall": "^2.25.0" },
    });
    expect(found.map((d: { name: string }) => d.name).sort()).toEqual([
      "@x402/paywall", "express", "vitest", "x402-express",
    ]);
    expect(found.find((d: { name: string }) => d.name === "x402-express")?.field).toBe("optionalDependencies");
  });

  it("survives a package.json with no dependencies at all", () => {
    expect(collectDeps({})).toEqual([]);
  });
});

describe("assessPackage", () => {
  const base = { now: NOW, deprecated: null };

  it("flags the x402 case: the package itself went quiet", () => {
    // x402-express 1.2.0 IS the latest — the project did not fall behind, it
    // stopped publishing under this name and continued as @x402/express. Comparing
    // our pin against latest can never see that; the silence is the only signal.
    const verdict = assessPackage({
      ...base,
      name: "x402-express",
      range: "1.2.0",
      latest: "1.2.0",
      latestTime: Date.parse("2026-04-16T18:10:00Z"),
      pinnedTime: Date.parse("2026-04-16T18:10:00Z"),
    });
    expect(verdict.severity).toBe("quiet-package");
    expect(verdict.detail).toContain("140d");
  });

  it("does not call a package quiet the day before the window closes", () => {
    const verdict = assessPackage({
      ...base,
      name: "apify",
      range: "3.7.2",
      latest: "3.7.2",
      latestTime: daysAgo(PACKAGE_QUIET_DAYS - 1),
      pinnedTime: daysAgo(PACKAGE_QUIET_DAYS - 1),
    });
    expect(verdict.severity).toBe("current");
  });

  it("cannot tell an abandoned package from a finished one, and says so by flagging both", () => {
    // express@5.2.1, quiet 276 days because express is mature. Same verdict as
    // x402-express above. This test exists to keep that limitation visible rather
    // than letting a future reader assume quiet-package means abandoned.
    const verdict = assessPackage({
      ...base,
      name: "express",
      range: "4.21.2",
      latest: "5.2.1",
      latestTime: daysAgo(276),
      pinnedTime: daysAgo(637),
    });
    expect(verdict.severity).toBe("quiet-package");
    expect(verdict.blocking).toBe(false);
  });

  it("flags a pin that stopped while the package kept moving", () => {
    const verdict = assessPackage({
      ...base,
      name: "typescript",
      range: "5.9.3",
      latest: "7.0.2",
      latestTime: daysAgo(57),
      pinnedTime: daysAgo(338),
    });
    expect(verdict.severity).toBe("abandoned-pin");
    expect(verdict.detail).toContain("281d after our pin stopped");
  });

  it("reports a major gap when both versions are recent", () => {
    const verdict = assessPackage({
      ...base,
      name: "@types/node",
      range: "22.20.1",
      latest: "26.4.1",
      latestTime: daysAgo(2),
      pinnedTime: daysAgo(30),
    });
    expect(verdict.severity).toBe("major-behind");
    expect(verdict.detail).toContain("4 major behind");
  });

  it("blocks only on a publisher's own deprecation", () => {
    const deprecated = assessPackage({
      ...base,
      name: "left-pad",
      range: "1.0.0",
      latest: "1.0.0",
      latestTime: daysAgo(1),
      pinnedTime: daysAgo(1),
      deprecated: "use String.prototype.padStart",
    });
    expect(deprecated.severity).toBe("deprecated");
    expect(deprecated.blocking).toBe(true);

    for (const severity of ["quiet-package", "abandoned-pin", "major-behind"]) {
      const sample = [
        assessPackage({ ...base, name: "a", range: "1.0.0", latest: "1.0.0", latestTime: daysAgo(300), pinnedTime: daysAgo(300) }),
        assessPackage({ ...base, name: "b", range: "1.0.0", latest: "1.5.0", latestTime: daysAgo(10), pinnedTime: daysAgo(400) }),
        assessPackage({ ...base, name: "c", range: "1.0.0", latest: "3.0.0", latestTime: daysAgo(10), pinnedTime: daysAgo(20) }),
      ].find((v) => v.severity === severity);
      expect(sample?.blocking, `${severity} must not block by default`).toBe(false);
    }
  });

  it("says so rather than guessing when the registry has nothing", () => {
    expect(assessPackage({ ...base, name: "ghost", range: "1.0.0", latest: null, latestTime: null, pinnedTime: null }).severity).toBe("unknown");
    expect(assessPackage({ ...base, name: "w", range: "workspace:*", latest: "1.0.0", latestTime: daysAgo(1), pinnedTime: null }).severity).toBe("unknown");
  });

  it("is current when the pin is the latest and the package is active", () => {
    const verdict = assessPackage({
      ...base, name: "@hebcal/core", range: "6.9.2", latest: "6.9.2",
      latestTime: daysAgo(26), pinnedTime: daysAgo(26),
    });
    expect(verdict.severity).toBe("current");
    expect(verdict.blocking).toBe(false);
  });
});
