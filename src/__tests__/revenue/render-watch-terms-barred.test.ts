import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design
import { TERMS_BARRED, fetchOne, parseUrlList, termsBarred } from "../../../scripts/render-watch.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { PATH_LIMITS, applyVerdicts, overrideLines, siteOf, termsGate } from "../../../scripts/queue-zero-test.mjs";

/**
 * Tick 19 (29.9.2026): Gumroad's rendered terms bar "any manual or automated software ... to
 * 'scrape' or download data from any web pages contained in the Services"
 * (research/rendered/gumroad-terms.txt:326). The runner had fetched thirteen Gumroad pages by
 * then, and the weekly schedule would have fetched them again. The TikTok pause's rule applies:
 * render-watch never fetches a site whose terms forbid it, from urls.txt, an override or a redirect.
 */
describe("render-watch refuses sites whose terms bar automated access", () => {
  it("names Gumroad first, citing the terms line that bars it, and the line says so", () => {
    expect(TERMS_BARRED[0].domain).toBe("gumroad.com");
    expect(TERMS_BARRED[0].why).toContain("gumroad-terms.txt:326");
    const terms = readFileSync("research/rendered/gumroad-terms.txt", "utf8").split("\n");
    expect(terms[325]).toMatch(/automated software.*"scrape" or download data from any web pages/);
  });

  it("matches the domain and every subdomain, ignoring case and a trailing dot, and nothing that only contains the name", () => {
    for (const h of ["gumroad.com", "www.gumroad.com", "WWW.Gumroad.COM.", "seller.gumroad.com", "api.gumroad.com"]) {
      expect(termsBarred(h), h).not.toBeNull();
    }
    for (const h of ["notgumroad.com", "gumroad.com.example.org", "example.com", "", undefined]) {
      expect(termsBarred(h), String(h)).toBeNull();
    }
  });

  it("refuses a Gumroad line at parse time, plain or js, so neither urls.txt nor an override can reach it", () => {
    expect(() => parseUrlList("https://gumroad.com/help/article/46-x\tgumroad-x\n")).toThrow(/gumroad\.com.*terms/);
    expect(() => parseUrlList("https://www.gumroad.com/terms\tgt\tjs\n")).toThrow(/gumroad-terms\.txt:326/);
    expect(() => parseUrlList("https://notgumroad.com/a\tng\n")).not.toThrow();
  });

  it("does not follow a redirect to Gumroad, and never requests it", async () => {
    const requested: string[] = [];
    const fetchImpl = async (url: string) => {
      requested.push(url);
      if (url === "https://short.example/x") {
        return { status: 302, ok: false, headers: { get: (k: string) => (k === "location" ? "https://Seller.Gumroad.com/l/pro" : null) } };
      }
      throw new Error(`unexpected request ${url}`);
    };
    const out = await fetchOne({ url: "https://short.example/x", slug: "x" }, { fetchImpl, timeoutMs: 1000 });
    expect(requested).toEqual(["https://short.example/x"]);
    expect(out.status).toBe(302);
    expect(out.error).toMatch(/redirected to gumroad\.com \(seller\.gumroad\.com\), whose terms bar automated access; not followed/);
  });

  it("leaves no active Gumroad line in the committed urls.txt, so the weekly run cannot fetch one", () => {
    const text = readFileSync("research/rendered/urls.txt", "utf8");
    const entries = parseUrlList(text); // throws if an active Gumroad line were left
    expect(entries.some((e: { url: string }) => /gumroad\.com/i.test(new URL(e.url).hostname))).toBe(false);
    // Paused in tick 19; retired by the sitting of 30.9 (RULING-2026-09-30-video.md 16(d) D2(ii)): Gumroad's terms bar any
    // fetch, and the refresh route is Gumroad's source on GitHub. Each retired line keeps its URL and slug as the record.
    expect(text.split("\n").filter((l) => l.startsWith("# paused (tick 19"))).toEqual([]);
    const retired = text.split("\n").filter((l) => l.startsWith("# retired (ruling 30.9 16(d) D2(ii)"));
    expect(retired).toHaveLength(13);
    for (const l of retired) {
      expect(l).toMatch(/refresh from antiwork\/gumroad on GitHub\) — https?:\/\/(www\.)?gumroad\.com\S*\t[a-z0-9-]+$/);
    }
    // A dispatch override for the Gumroad rows now finds only paused rows.
    expect(() => overrideLines(text, 180, 186)).toThrow(/every row is retired/);
  });
});

/**
 * Tick 20's terms audit of all 81 sites active in urls.txt (research/channel-loop/TERMS-AUDIT-2026-09-29.md):
 * ten barred automated access outright, and three more had a condition the runner does not meet (robots.txt,
 * which render-watch does not read, and Mozilla's ban on harvesting personal information).
 */
describe("the terms audit's barred sites (29.9.2026)", () => {
  const AUDITED = [
    "paypal.com",
    "teachsimple.com",
    "indiebook.co.il",
    "astro.build",
    "facer.io",
    "facercreator.io",
    "youtube.com",
    "blog.youtube",
    "google.com",
    // googlesource.com was here: its only condition was robots.txt, which render-watch reads since 30.9, so it left
    // TERMS_BARRED for CONDITIONAL_MET (ruling 30.9 16(d) D2(v); tested below).
    "metaculus.com",
    "openai.com",
    "addons.mozilla.org",
  ];

  it("lists each audited site once, each with a citation of the clause or condition", () => {
    const domains = TERMS_BARRED.map((b: { domain: string }) => b.domain);
    expect(domains.slice(1, 1 + AUDITED.length)).toEqual(AUDITED);
    expect(new Set(domains).size).toBe(domains.length);
    for (const b of TERMS_BARRED as { domain: string; why: string }[]) {
      expect(b.why, b.domain).toMatch(/(\.txt:\d+|\.md:\d+|\.html:\d+|\.tsx:\d+|bytes \d+)/);
    }
  });

  it("bars exactly those sites: Mozilla's other sites and GitHub are not caught by a neighbour's entry", () => {
    for (const h of ["support.google.com", "developers.google.com", "www.youtube.com", "blog.youtube", "addons.mozilla.org", "www.paypal.com", "community.facer.io"]) {
      expect(termsBarred(h), h).not.toBeNull();
    }
    for (const h of ["www.mozilla.org", "extensionworkshop.com", "github.com", "raw.githubusercontent.com", "googleapis.com", "notyoutube.com", "displate.com", "www.nevo.co.il", "chromium.googlesource.com"]) {
      expect(termsBarred(h), h).toBeNull();
    }
  });

  it("leaves no active line in urls.txt on any barred site", () => {
    const entries = parseUrlList(readFileSync("research/rendered/urls.txt", "utf8"));
    const hits = entries.filter((e: { url: string }) => termsBarred(new URL(e.url).hostname));
    expect(hits).toEqual([]);
  });

  it("keeps no author record or email address in the stored AMO search results (Mozilla's acceptable-use policy)", () => {
    const email = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
    for (const slug of ["amo-search-newest", "amo-search-hebrew", "amo-search-invoice", "amo-hebrew-langpack"]) {
      const text = readFileSync(`research/rendered/${slug}.json`, "utf8");
      const leaks = text.split("\n").filter((l) => email.test(l) && !/"guid":/.test(l));
      expect(leaks, slug).toEqual([]);
      const body = JSON.parse(text);
      for (const r of body.results ?? [body]) {
        expect(Array.isArray(r.authors), slug).toBe(false);
      }
    }
  });
});

/**
 * Tick 21 (29.9.2026): the rule "read a site's terms before its first line" as a check. Every site render-watch has a
 * line for carries a verdict in research/channel-loop/terms-verdicts.json, and a line may be active only when its site's
 * terms were read and allow it, or when the line is the site's own terms page and that page is still pending.
 */
describe("terms-verdicts.json gates every active line (terms audit round 2)", () => {
  const verdicts = JSON.parse(readFileSync("research/channel-loop/terms-verdicts.json", "utf8")).sites as Record<string, { verdict: string; source: string }>;
  const VERDICTS = ["NOT_BARRED", "CONDITIONAL_MET", "TERMS_PENDING", "CONDITIONAL_UNMET", "BARRED", "NO_TERMS", "NO_TERMS_ROBOTS_OK"];
  const entries = () => parseUrlList(readFileSync("research/rendered/urls.txt", "utf8")) as { url: string; slug: string }[];

  it("gives every site a known verdict and a source", () => {
    for (const [site, v] of Object.entries(verdicts)) {
      expect(VERDICTS, site).toContain(v.verdict);
      expect(v.source.length, site).toBeGreaterThan(5);
    }
  });

  it("lets a line be active only on a site whose terms allow it, or as a pending site's own terms page", () => {
    // Since 30.9 (ruling 16(d) D2(iv)-(v)): NO_TERMS_ROBOTS_OK allows a line too, as scripts/robots-verdict.mjs writes
    // it (a note opening exhaustive-negative, a source naming the script), and a robots- probe of /robots.txt is
    // allowed for a NO_TERMS site whose note opens exhaustive-negative. Not for a TERMS_PENDING site: unread terms,
    // no fetch but the terms page.
    const bad = entries().filter((e) => {
      const entry = verdicts[siteOf(new URL(e.url).hostname.toLowerCase())] as { verdict: string; source?: string; note?: string } | undefined;
      const v = entry?.verdict;
      const probe = e.slug.startsWith("robots-") && new URL(e.url).pathname === "/robots.txt";
      const exhaustiveNote = /^exhaustive-negative\b/.test(entry?.note ?? "");
      const exhaustive = v === "NO_TERMS" && exhaustiveNote;
      const robotsOk = v === "NO_TERMS_ROBOTS_OK" && exhaustiveNote && (entry?.source ?? "").includes("scripts/robots-verdict.mjs");
      return !(
        v === "NOT_BARRED" ||
        v === "CONDITIONAL_MET" ||
        robotsOk ||
        (v === "TERMS_PENDING" && e.slug.startsWith("terms-")) ||
        (probe && exhaustive)
      );
    });
    expect(bad.map((e) => e.slug)).toEqual([]);
  });

  it("holds every NO_TERMS_ROBOTS_OK entry to what scripts/robots-verdict.mjs writes: an exhaustive-negative note, the script in its source", () => {
    // Ruling 30.9 16(d) D2(v): the verdict is "set only for exhaustive-negative sites by a script that reads the site's
    // robots.txt for the queued paths". An entry edited in by hand, on a refusal-type site or anywhere else, fails here.
    const robotsOk = Object.entries(verdicts).filter(([, v]) => v.verdict === "NO_TERMS_ROBOTS_OK") as [
      string,
      { verdict: string; source: string; note?: string },
    ][];
    for (const [site, v] of robotsOk) {
      expect(v.note ?? "", site).toMatch(/^exhaustive-negative\b/);
      expect(v.source, site).toContain("scripts/robots-verdict.mjs");
    }
  });

  it("makes googlesource.com CONDITIONAL_MET now that render-watch reads robots.txt, and keeps google.com BARRED", () => {
    // Its one condition was robots.txt (research/colony-sweep/scouts/risk-governance--automation-tos.md:106); the
    // ruling of 30.9 (16(d) D2(v)) makes it CONDITIONAL_MET once render-watch honours robots.txt with an identifying UA.
    const gs = verdicts["googlesource.com"] as { verdict: string; source: string; note?: string };
    expect(gs.verdict).toBe("CONDITIONAL_MET");
    expect(`${gs.source} ${gs.note}`).toContain("RULING-2026-09-30-video.md 16(d) D2(v)");
    expect(`${gs.source} ${gs.note}`).toContain("risk-governance--automation-tos.md:106");
    expect(gs.note).toMatch(/robotsChecker/);
    expect(termsBarred("chromium.googlesource.com")).toBeNull();
    // google.com stays barred: YouTube's terms bar the Help pages outright (ruling 30.9 16(d) D2(v)).
    expect(verdicts["google.com"].verdict).toBe("BARRED");
    expect(termsBarred("support.google.com")?.domain).toBe("google.com");
    expect(termsBarred("support.google.com")?.why).toContain("discovery.md:209-211");
  });

  it("un-pauses the googlesource line to its original active form, and nothing else of Google's", () => {
    const text = readFileSync("research/rendered/urls.txt", "utf8");
    expect(text.split("\n")).toContain("https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/vrp-faq.md\tsweep2-google-vrp-faq");
    expect(text).not.toMatch(/^# paused .*googlesource\.com/m);
    const active = entries().filter((e) => /(^|\.)google(source)?\.com$/.test(new URL(e.url).hostname));
    expect(active.map((e) => e.slug)).toEqual(["sweep2-google-vrp-faq"]);
  });

  it("records the round-2 barred sites in TERMS_BARRED, each with its citation", () => {
    const ROUND2 = ["bit2c.co.il", "freemius.com", "hackmd.io", "icount.co.il", "lomdimhofshi.co.il", "community.n8n.io", "notion.site", "upload-post.com", "wix.com", "crazygames.com", "pexels.com", "pixabay.com", "spreadshirt.com", "spreadshop.com", "teacherspayteachers.com"];
    for (const d of ROUND2) {
      const b = (TERMS_BARRED as { domain: string; why: string }[]).find((x) => x.domain === d);
      expect(b, d).toBeDefined();
      expect(b!.why, d).toMatch(/round 2/);
    }
    // The forum is barred; n8n's main site is not caught by the forum's entry.
    expect(termsBarred("n8n.io")).toBeNull();
    expect(termsBarred("n8n.notion.site")?.domain).toBe("notion.site");
  });

  it("keeps nevo's already captured law pages readable while no new nevo line can run", () => {
    expect(verdicts["nevo.co.il"].verdict).toBe("NO_TERMS");
    // Only nevo's robots.txt probe may be active (ruling 30.9 16(d) D2(v)); no law page is fetched again.
    const nevo = entries().filter((e) => /nevo\.co\.il$/.test(new URL(e.url).hostname));
    expect(nevo.every((e) => new URL(e.url).pathname === "/robots.txt")).toBe(true);
    expect(readFileSync("research/rendered/nevo-vat-law.txt", "utf8")).toContain("122,833");
  });
});

/**
 * Ruling 4.10 on FABLE_QUEUE row 18 (research/channel-loop/RULING-2026-10-04-mozilla-precondition.md §3). The AMO
 * add-on policy page was still an active urls.txt line although Firefox was killed 29.9, so the weekly run would have
 * fetched it again; it is retired, and its capture stays as the kill's evidence (frozen by tick 38). mozilla.org's
 * verdict was BARRED on "its other pages have no active line", a statement about our lines rather than a reading of its
 * terms; it is now the audit's terms reading, CONDITIONAL_UNMET on the personal-data condition, and the gate behaves as
 * before: no mozilla.org line passes.
 */
describe("ruling 4.10 row 18 §3: the AMO policy line retired, mozilla.org judged on its terms", () => {
  const POLICY_URL = "https://extensionworkshop.com/documentation/publish/add-on-policies/";
  const urlsText = () => readFileSync("research/rendered/urls.txt", "utf8");
  const verdicts = () => JSON.parse(readFileSync("research/channel-loop/terms-verdicts.json", "utf8")).sites;

  it("retires the AMO add-on policy line in the house form, keeping its URL and slug as the record", () => {
    const lines = urlsText().split("\n").filter((l) => l.includes(POLICY_URL));
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(
      /^# retired \(ruling 4\.10 row 18 §3 rule 1: Firefox Add-ons \(loop row 16\) was killed 29\.9, RULING-2026-09-29-loop\.md \(a\);[^\n]*the capture stays as the kill's rendered evidence[^\n]*\) — https:\/\/extensionworkshop\.com\/documentation\/publish\/add-on-policies\/\tamo-add-on-policies$/,
    );
    expect((parseUrlList(urlsText()) as { slug: string }[]).some((e) => e.slug === "amo-add-on-policies")).toBe(false);
    // The line went because its candidate was killed, not because of the site's terms: extensionworkshop.com keeps its
    // verdict, and the frozen copy the kill and the terms audit cite by line is still on disk.
    expect(verdicts()["extensionworkshop.com"].verdict).toBe("CONDITIONAL_MET");
    for (const ext of ["txt", "html", "meta.json"]) {
      expect(existsSync(`research/rendered/amo-add-on-policies-2026-09-28.${ext}`), ext).toBe(true);
    }
    expect(readFileSync("research/rendered/FROZEN.sha256", "utf8")).toContain("amo-add-on-policies-2026-09-28.txt");
  });

  it("marks ZERO-TESTS row 34, the line's row, retired for the same reason", () => {
    const row = readFileSync("research/channel-loop/ZERO-TESTS.md", "utf8").split("\n").find((l) => l.startsWith("| 34 |"))!;
    expect(row).toContain(POLICY_URL);
    expect(row).toContain("**RETIRED (status noted 4.10, ruling 4.10 row 18 §3 rule 1: Firefox Add-ons, loop row 16, was killed 29.9;");
    expect(row).toMatch(/see its urls\.txt line\)\.\*\* \|$/);
  });

  it("gives mozilla.org the audit's terms reading: CONDITIONAL_UNMET on the personal-data condition, with the ruling's note", () => {
    const m = verdicts()["mozilla.org"] as { verdict: string; source: string; checked: string; note: string };
    expect(m.verdict).toBe("CONDITIONAL_UNMET");
    expect(m.source).toContain("mozilla/legal-docs en/websites_tou.md");
    expect(m.source).toContain("en/acceptable_use_policy.md:14");
    expect(m.source).toContain("no access bar");
    expect(m.source).toContain("TERMS-AUDIT-2026-09-29.md:27, :138");
    expect(m.checked).toBe("2026-10-04");
    expect(m.note).toContain("RULING-2026-10-04-mozilla-precondition.md");
    expect(m.note).toContain("addons.mozilla.org stays in TERMS_BARRED");
    expect(m.note).toContain("no bugzilla.mozilla.org /rest/ line is ever active");
    expect(m.note).toContain("CONDITIONAL_MET only in the fold that queues a line whose capture lists no accounts or addresses");
  });

  it("changes nothing at the gate: no mozilla.org page passes, and the AMO API stays barred by name", () => {
    const v = verdicts();
    for (const url of ["https://www.mozilla.org/en-US/security/client-bug-bounty/", "https://bugzilla.mozilla.org/rest/bug/1"]) {
      const gate = termsGate(url, "x", v);
      expect(gate.ok, url).toBe(false);
      expect(gate.verdict, url).toBe("CONDITIONAL_UNMET");
    }
    expect(termsGate("https://addons.mozilla.org/api/v5/addons/search/", "x", v).verdict).toBe("BARRED");
    expect(termsBarred("addons.mozilla.org")?.domain).toBe("addons.mozilla.org");
    const active = (parseUrlList(urlsText()) as { url: string }[]).filter((e) => siteOf(new URL(e.url).hostname) === "mozilla.org");
    expect(active).toEqual([]);
  });
});

/**
 * Tick 40 review, defect 2. posthog.com is NOT_BARRED for access (research/channel-loop/terms/posthog-terms-2026-10-04.md),
 * but its repository's LICENSE asks "Please do not duplicate, copy, or use our website" for everything outside /contents/
 * (PostHog/posthog.com LICENSE:5-6 at 35fc817), and a render line commits what it captures. The verdict's note said no
 * page outside the docs is committed, and nothing enforced it: a posthog.com/pricing line would have passed every gate.
 * Only /contents/ builds /docs/ and /tutorials/, so the terms gate admits posthog.com lines there and nowhere else.
 */
describe("PATH_LIMITS: posthog.com lines only under /docs/ or /tutorials/ (tick 40 review, defect 2)", () => {
  const verdicts = () => JSON.parse(readFileSync("research/channel-loop/terms-verdicts.json", "utf8")).sites;

  it("names posthog.com, its two paths and the licence line, and the verdict's note points at it", () => {
    const limit = (PATH_LIMITS as Record<string, { prefixes: string[]; why: string }>)["posthog.com"];
    expect(limit.prefixes).toEqual(["/docs/", "/tutorials/"]);
    expect(limit.why).toContain("LICENSE:5-6");
    expect(verdicts()["posthog.com"].verdict).toBe("NOT_BARRED");
    expect(verdicts()["posthog.com"].note).toContain("the terms gate admits a posthog.com line only under /docs/ or /tutorials/ (PATH_LIMITS in scripts/queue-zero-test.mjs)");
    expect(JSON.parse(readFileSync("research/channel-loop/terms-verdicts.json", "utf8"))._about).toContain("a line on a site in PATH_LIMITS (scripts/queue-zero-test.mjs termsGate) passes only under that site's listed paths");
  });

  it("refuses a posthog.com line outside those paths, on any of the site's hosts and whatever its slug", () => {
    const v = verdicts();
    for (const [url, slug] of [
      ["https://posthog.com/pricing", "posthog-pricing"],
      ["https://posthog.com/terms", "terms-posthog"],
      ["https://posthog.com/", "posthog-home"],
      ["https://posthog.com/docs", "posthog-docs-index"],
      ["https://posthog.com/blog/x", "posthog-blog"],
      ["https://posthog.com/handbook/docs/x", "posthog-handbook"],
      ["https://eu.posthog.com/api/projects/1/query/", "posthog-query"],
    ]) {
      const gate = termsGate(url, slug, v);
      expect(gate.ok, url).toBe(false);
      expect(gate.site, url).toBe("posthog.com");
      expect(gate.verdict, url).toBe("NOT_BARRED");
      expect(gate.why, url).toMatch(/posthog\.com lines may be active only under \/docs\/ or \/tutorials\//);
    }
    for (const url of ["https://posthog.com/docs/api/queries", "https://posthog.com/tutorials/cookieless-tracking"]) {
      expect(termsGate(url, "posthog-x", v).ok, url).toBe(true);
    }
    // Another NOT_BARRED site has no path limit.
    expect(termsGate("https://docs.apify.com/legal/general-terms-and-conditions", "x", v).ok).toBe(true);
  });

  it("leaves no active urls.txt line that the terms gate refuses", () => {
    const v = verdicts();
    const entries = parseUrlList(readFileSync("research/rendered/urls.txt", "utf8")) as { url: string; slug: string }[];
    expect(entries.filter((e) => !termsGate(e.url, e.slug, v).ok).map((e) => e.slug)).toEqual([]);
  });

  it("pauses a path-limited line in its own words, not as terms unread", () => {
    const out = applyVerdicts("https://posthog.com/pricing\tposthog-pricing\nhttps://posthog.com/docs/api/queries\tposthog-queries\n", verdicts());
    expect(out.paused).toEqual(["posthog-pricing"]);
    expect(out.urls).toBe(
      "# paused (path limit): posthog.com — see PATH_LIMITS in scripts/queue-zero-test.mjs — https://posthog.com/pricing\tposthog-pricing\nhttps://posthog.com/docs/api/queries\tposthog-queries\n",
    );
  });
});

/**
 * Tick 54 (6.10.2026): the terms pages of the prize-event sites, read on their frozen copies (research/channel-loop/
 * TERMS-AUDIT-2026-10-05-prize-events.md, "Terms read (6.10.2026, tick 54)"). Devpost's terms bar automated access and
 * scraping of the Site and of User Content, which its hackathon sites are; Zindi's bar reproducing, storing or
 * transmitting the site's material, and its terms page names zindi.world as its own address, so both hosts are barred.
 */
describe("the prize-event terms read of 6.10 (tick 54): devpost.com, zindi.africa, zindi.world", () => {
  const BARRED_54: { domain: string; file: string; line: number; words: string }[] = [
    {
      domain: "devpost.com",
      file: "research/rendered/terms-devpost-2026-10-06.txt",
      line: 159,
      words: "manual or automated software, devices, scripts robots, or other means or processes to access, “scrape,” “crawl” or “spider” the Site, User Content",
    },
    {
      domain: "zindi.africa",
      file: "research/rendered/terms-zindi-2026-10-06.txt",
      line: 68,
      words:
        "You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store or transmit any of the material on our Website",
    },
    {
      domain: "zindi.world",
      file: "research/rendered/terms-zindi-2026-10-06.txt",
      line: 68,
      words: "store or transmit any of the material on our Website",
    },
  ];
  const verdicts = () => JSON.parse(readFileSync("research/channel-loop/terms-verdicts.json", "utf8")).sites;

  it("lists the three last, each citing the frozen copy's line, whose words it quotes", () => {
    const domains = (TERMS_BARRED as { domain: string }[]).map((b) => b.domain);
    expect(domains.slice(-3)).toEqual(BARRED_54.map((b) => b.domain));
    for (const { domain, file, line, words } of BARRED_54) {
      const b = (TERMS_BARRED as { domain: string; why: string }[]).find((x) => x.domain === domain)!;
      expect(b.why, domain).toContain(`${file}:${line}`);
      expect(b.why, domain).toContain("terms read 6.10, tick 54");
      // The frozen copy (never rewritten by the weekly run) holds the words at that line, and the entry quotes them.
      expect(readFileSync(file, "utf8").split("\n")[line - 1], domain).toContain(words);
      if (domain !== "zindi.world") expect(b.why, domain).toContain(words.split(", User Content")[0]);
      expect(existsSync(file.replace(/\.txt$/, ".meta.json")), domain).toBe(true);
    }
    // zindi.world: the page's own og:url names it (the html line the entry cites), which is why it is barred with zindi.africa.
    const zw = (TERMS_BARRED as { domain: string; why: string }[]).find((x) => x.domain === "zindi.world")!;
    expect(zw.why).toContain("research/rendered/terms-zindi-2026-10-06.html:50");
    expect(zw.why).toContain("[inference]");
    expect(readFileSync("research/rendered/terms-zindi-2026-10-06.html", "utf8").split("\n")[49]).toContain('og:url" content="https://zindi.world/terms"');
  });

  it("bars every Devpost hackathon host and its terms host, both Zindi hosts, and nothing that only contains the names", () => {
    for (const h of [
      "devpost.com",
      "info.devpost.com",
      "qwencloud-hackathon.devpost.com",
      "xprize.devpost.com",
      "ADTC-2026.Devpost.com.",
      "zindi.africa",
      "www.zindi.africa",
      "zindi.world",
      "api.zindi.world",
    ]) {
      expect(termsBarred(h), h).not.toBeNull();
    }
    for (const h of ["notdevpost.com", "devpost.com.example.org", "zindi.africa.example.org", "zindiworld.com", "grand-challenge.org", "www.stanford.edu"]) {
      expect(termsBarred(h), h).toBeNull();
    }
    expect(() => parseUrlList("https://xprize.devpost.com/rules\tdevpost-xprize\n")).toThrow(/devpost\.com.*terms/);
    expect(() => parseUrlList("https://zindi.africa/competitions/x\tzindi-x\n")).toThrow(/zindi\.africa/);
  });

  it("agrees with the verdicts file, and leaves only the paused terms lines of the two sites in urls.txt", () => {
    const v = verdicts();
    expect(v["devpost.com"].verdict).toBe("BARRED");
    expect(v["zindi.africa"].verdict).toBe("BARRED");
    for (const site of ["devpost.com", "zindi.africa"]) {
      expect(v[site].note, site).toContain("TERMS_BARRED in scripts/render-watch.mjs holds");
      expect(v[site].copying, site).toBe("barred");
    }
    const text = readFileSync("research/rendered/urls.txt", "utf8");
    const lines = text.split("\n").filter((l) => /(^|[/.])(devpost\.com|zindi\.africa|zindi\.world)\//.test(l.replace(/^# .* — /, "")));
    expect(lines).toEqual([
      "# paused (terms audit): devpost.com — see TERMS_BARRED in scripts/render-watch.mjs — https://info.devpost.com/legal/terms-of-service\tterms-devpost",
      "# paused (terms audit): zindi.africa — see TERMS_BARRED in scripts/render-watch.mjs — https://zindi.africa/terms\tterms-zindi",
    ]);
    // The gate says so for any line on those hosts.
    expect(termsGate("https://datahub.devpost.com/?ref=mlcontests", "x", v).why).toMatch(/^devpost\.com is in TERMS_BARRED: /);
    expect(termsGate("https://zindi.world/competitions/x", "x", v).why).toMatch(/^zindi\.world is in TERMS_BARRED: /);
  });
});
