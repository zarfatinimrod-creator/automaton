import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design
import { parseUrlList } from "../../../scripts/render-watch.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { PATH_LIMITS, applyVerdicts, isExhaustiveNegative, isRobotsProbe, siteOf, termsGate } from "../../../scripts/queue-zero-test.mjs";

/**
 * Tick 45 (5.10.2026): the terms audit of the prize-event sites, step 0 of the rules-page reading (logs/CHANNEL_LOOP.md
 * §4 row 13; research/measurements/ai-allowed-events.md). The 101 rules URLs of research/measurements/ai-allowed-events.urls.txt
 * sit on 45 sites; github.com and google.com were judged before, and the other 43 are judged here
 * (research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md). The tick-20 rule (a site's terms are read before its
 * first line is fetched) decides what may be queued: a TERMS_PENDING site gets its terms page only, an
 * exhaustive-negative NO_TERMS site its robots.txt only (ruling 30.9 16(d) D2(iv)-(v)), and no rules page goes into
 * research/rendered/urls.txt at all.
 */
const VERDICTS = "research/channel-loop/terms-verdicts.json";
const URLS = "research/rendered/urls.txt";
const PRIZE_URLS = "research/measurements/ai-allowed-events.urls.txt";
type Entry = { verdict: string; source: string; checked: string; note?: string };
const verdicts = () => JSON.parse(readFileSync(VERDICTS, "utf8")).sites as Record<string, Entry>;
const active = () => parseUrlList(readFileSync(URLS, "utf8")) as { url: string; slug: string }[];
/**
 * The prize list's lines, read by hand: render-watch's parser refuses the list whole, because one rules URL is on
 * sites.google.com (google.com is in TERMS_BARRED), which is why a dispatch takes only the allowed sites' lines.
 */
const prizeLines = () =>
  readFileSync(PRIZE_URLS, "utf8")
    .split("\n")
    .filter((l) => l.trim() !== "" && !l.startsWith("#"))
    .map((l) => {
      const [url, slug] = l.split("\t");
      return { url, slug };
    });

const AUDITED: Record<string, string> = {
  "adaptionlabs.ai": "TERMS_PENDING",
  "agenthon.net": "NO_TERMS",
  "aicrowd.com": "NO_TERMS",
  "aimo-interp.github.io": "CONDITIONAL_MET",
  "alignmentforum.org": "NO_TERMS",
  "ansperformance.eu": "CONDITIONAL_UNMET",
  "bcamlc.com": "NO_TERMS",
  "build-arena.github.io": "CONDITIONAL_MET",
  "codabench.org": "CONDITIONAL_UNMET",
  "crunchdao.com": "NO_TERMS",
  "devpost.com": "TERMS_PENDING",
  "drivendata.org": "NO_TERMS",
  "eurocontrol.int": "TERMS_PENDING",
  "flagos.io": "NO_TERMS",
  "fomo26.github.io": "CONDITIONAL_MET",
  "geminixprize.com": "NO_TERMS",
  "grand-challenge.org": "TERMS_PENDING",
  "health-data-hub.fr": "NO_TERMS",
  "ijcai.org": "NO_TERMS",
  "k12-ai-infrastructure.org": "NO_TERMS",
  "kaggle.com": "TERMS_PENDING",
  "lbl.gov": "CONDITIONAL_MET",
  "learn2design2026.com": "NO_TERMS",
  "microblink.com": "NO_TERMS",
  "mozilladatacollective.com": "NO_TERMS",
  "neural-interfaces26.github.io": "CONDITIONAL_MET",
  "opensky-network.org": "TERMS_PENDING",
  "openreview.net": "NOT_BARRED",
  "pasteurlabs.ai": "NO_TERMS",
  "realpdecompetition.github.io": "CONDITIONAL_MET",
  "robosyn-bench.net": "CONDITIONAL_MET",
  "roco-spring.github.io": "CONDITIONAL_MET",
  "situatedevals.org": "NO_TERMS",
  "solafune.com": "NO_TERMS",
  "sophelio.io": "NO_TERMS",
  "stanford.edu": "TERMS_PENDING",
  "szczurek-lab.github.io": "CONDITIONAL_MET",
  "theemailgame.com": "NO_TERMS",
  "thinkonward.com": "NO_TERMS",
  "virtualembryo.ai": "TERMS_PENDING",
  "wundernn.io": "NO_TERMS",
  "xiuwenz2.github.io": "CONDITIONAL_MET",
  "zindi.africa": "TERMS_PENDING",
};
/** The NO_TERMS sites whose auditor searched Open Terms Archive in only eight declarations repos: no probe. */
const THIN = ["health-data-hub.fr", "ijcai.org", "mozilladatacollective.com"];

describe("tick 45: the prize-event sites' terms verdicts", () => {
  it("judges every site of the 101 rules URLs: the 43 audited here, github.com and google.com before", () => {
    const sites = new Set(prizeLines().map((e) => siteOf(new URL(e.url).hostname)));
    expect(prizeLines()).toHaveLength(101);
    expect([...sites].sort()).toEqual([...Object.keys(AUDITED), "github.com", "google.com"].sort());
    const v = verdicts();
    for (const [site, verdict] of Object.entries(AUDITED)) {
      expect(v[site]?.verdict, site).toBe(verdict);
      expect(v[site].checked, site).toBe("2026-10-05");
      expect(v[site].source, site).toContain("TERMS-AUDIT-2026-10-05-prize-events.md");
    }
    expect(v["github.com"].verdict).toBe("CONDITIONAL_MET");
    expect(v["google.com"].verdict).toBe("BARRED");
  });

  it("rests the GitHub-hosted verdicts on the saved copies, and the GitHub Pages ones on github.com's open-access condition", () => {
    const v = verdicts();
    for (const [site, verdict] of Object.entries(AUDITED)) {
      if (verdict !== "CONDITIONAL_MET") continue;
      expect(v[site].source, site).toContain("research/channel-loop/terms/github-acceptable-use-policies-2026-10-05.md");
      expect(v[site].source, site).toContain("research/channel-loop/terms/github-terms-of-service-2026-10-05.md");
      expect(v[site].note, site).toContain("the condition holds only while this research is published open access, i.e. while the repo is public");
    }
    expect(v["openreview.net"].source).toContain("research/channel-loop/terms/openreview-terms-of-use-2026-10-05.md");
    expect(v["codabench.org"].source).toContain("research/channel-loop/terms/codabench-privacy-and-terms-2026-10-05.md");
    expect(v["ansperformance.eu"].source).toContain("research/channel-loop/terms/ansperformance-disclaimer-2026-10-05.md");
  });

  it("queues exactly one terms- line for each TERMS_PENDING site, at the terms URL its verdict names, and nothing else of it", () => {
    const v = verdicts();
    const lines = active();
    for (const [site, verdict] of Object.entries(AUDITED)) {
      if (verdict !== "TERMS_PENDING") continue;
      const mine = lines.filter((e) => siteOf(new URL(e.url).hostname) === site);
      expect(mine, site).toHaveLength(1);
      expect(mine[0].slug, site).toMatch(/^terms-/);
      expect(v[site].source.startsWith(`${mine[0].url} (`), site).toBe(true);
      expect(termsGate(mine[0].url, mine[0].slug, v).ok, site).toBe(true);
    }
  });

  it("opens the note exhaustive-negative only where both searches covered Open Terms Archive, tosdr and the site's GitHub, and queues each such site one robots.txt probe", () => {
    const v = verdicts();
    const lines = active();
    for (const [site, verdict] of Object.entries(AUDITED)) {
      if (verdict !== "NO_TERMS") continue;
      const mine = lines.filter((e) => siteOf(new URL(e.url).hostname) === site);
      if (THIN.includes(site)) {
        expect(isExhaustiveNegative(v[site]), site).toBe(false);
        expect(v[site].note, site).toMatch(/^not exhaustive-negative: /);
        expect(mine, site).toEqual([]);
        continue;
      }
      expect(isExhaustiveNegative(v[site]), site).toBe(true);
      expect(v[site].note, site).toMatch(/^exhaustive-negative \(Open Terms Archive: .*tosdr\/tosdr-snapshots.*auditor and verifier\)\. /);
      expect(mine, site).toHaveLength(1);
      expect(isRobotsProbe(mine[0].url, mine[0].slug), site).toBe(true);
      // The probe reads the host that serves the site's rules pages.
      const hosts = new Set(prizeLines().filter((e) => siteOf(new URL(e.url).hostname) === site).map((e) => new URL(e.url).hostname));
      expect(hosts.has(new URL(mine[0].url).hostname), site).toBe(true);
      expect(termsGate(mine[0].url, mine[0].slug, v).ok, site).toBe(true);
    }
    expect(Object.values(AUDITED).filter((x) => x === "NO_TERMS")).toHaveLength(21);
  });

  it("puts no rules page into research/rendered/urls.txt, and the gate refuses every prize rules URL it should", () => {
    const v = verdicts();
    // Every URL anywhere in the list, active or commented out.
    const listed = new Set(readFileSync(URLS, "utf8").match(/https?:\/\/\S+/g));
    for (const e of prizeLines()) {
      expect(listed.has(e.url), e.url).toBe(false);
      const site = siteOf(new URL(e.url).hostname);
      const gate = termsGate(e.url, e.slug, v);
      const open = ["CONDITIONAL_MET", "NOT_BARRED"].includes(v[site].verdict);
      expect(gate.ok, `${site} ${e.url}`).toBe(open);
    }
    // The new lines pass the gate, so applying the verdicts pauses nothing.
    expect(applyVerdicts(readFileSync(URLS, "utf8"), v).paused).toEqual([]);
  });

  it("confines lbl.gov's CONDITIONAL_MET to the GitHub Pages host it rests on", () => {
    const v = verdicts();
    const limit = (PATH_LIMITS as Record<string, { hosts?: string[]; prefixes: string[]; why: string }>)["lbl.gov"];
    expect(limit.hosts).toEqual(["fair-universe.lbl.gov"]);
    expect(termsGate("https://fair-universe.lbl.gov/?ref=mlcontests", "x", v).ok).toBe(true);
    expect(termsGate("https://FAIR-Universe.lbl.gov./x", "x", v).ok).toBe(true);
    for (const url of ["https://www.lbl.gov/", "https://lbl.gov/x", "https://other.lbl.gov/fair-universe.lbl.gov"]) {
      const gate = termsGate(url, "x", v);
      expect(gate.ok, url).toBe(false);
      expect(gate.pathLimited, url).toBe(true);
      expect(gate.why, url).toMatch(/^lbl\.gov lines may be active only on fair-universe\.lbl\.gov under \//);
    }
    expect(applyVerdicts("https://www.lbl.gov/x\tlbl-x\n", v).urls).toMatch(/^# paused \(path limit\): lbl\.gov — see PATH_LIMITS/);
    expect(v["lbl.gov"].note).toContain("admits lbl.gov lines on fair-universe.lbl.gov only");
    // posthog.com's path limit names no hosts and reads as before.
    expect(termsGate("https://posthog.com/pricing", "x", v).why).toMatch(/^posthog\.com lines may be active only under \/docs\/ or \/tutorials\//);
  });
});
