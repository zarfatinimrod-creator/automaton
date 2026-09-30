import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design (same as queue-zero-test.mjs)
import { classifyCapture, readCapture } from "../../../scripts/capture-check.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { MIN_TERMS_TEXT } from "../../../scripts/queue-zero-test.mjs";

/**
 * scripts/capture-check.mjs flags render-watch captures the reader should not take as read pages: a refused fetch
 * ("status"), a bot challenge ("bot-challenge"), a page that needs JavaScript to show its text ("js-shell"), or too
 * little text with no other sign ("short"). "Too little" is queue-zero-test's MIN_TERMS_TEXT. It only flags: it
 * writes nothing and judges nothing (ruling 16(d) D2(iv) — a site's refusal, including a bot challenge, is its
 * answer — is applied by the reader, not by this script).
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "capture-check.mjs");
const RENDERED = join(ROOT, "research", "rendered");

const OK_META = { status: 200, error: null, contentType: "text/html; charset=utf-8", bodyPath: "research/rendered/x.html", textPath: "research/rendered/x.txt" };
const LONG = "Terms of service. ".repeat(100); // 1,800 characters
const SHORT = "Loading";
const page = (body: string, head = "") => `<!doctype html><html><head><title>t</title>${head}</head><body>${body}</body></html>`;
const classify = (over: { meta?: Record<string, unknown>; text?: string | null; html?: string | null }) =>
  classifyCapture({ meta: { ...OK_META, ...(over.meta ?? {}) }, text: over.text === undefined ? LONG : over.text, html: over.html === undefined ? page("<p>x</p>") : over.html });

describe("classifyCapture: one case per kind", () => {
  it("ok: enough text and a 2xx status", () => {
    expect(classify({}).kind).toBe("ok");
  });

  it("the threshold is queue-zero-test's MIN_TERMS_TEXT: exactly that many characters is ok, one fewer is short", () => {
    expect(classify({ text: "a".repeat(MIN_TERMS_TEXT) }).kind).toBe("ok");
    const short = classify({ text: `  ${"a".repeat(MIN_TERMS_TEXT - 1)}\n` });
    expect(short.kind).toBe("short");
    expect(short.evidence).toContain(`${MIN_TERMS_TEXT - 1} characters`);
  });

  it("the script imports MIN_TERMS_TEXT rather than copying the number", () => {
    const src = readFileSync(SCRIPT, "utf8");
    expect(src).toMatch(/import\s*\{[^}]*\bMIN_TERMS_TEXT\b[^}]*\}\s*from\s*"\.\/queue-zero-test\.mjs"/);
    expect(src).not.toMatch(new RegExp(`\\b${MIN_TERMS_TEXT}\\b`));
  });

  it.each([
    ["a 403 with its error", { status: 403, error: "HTTP 403 Forbidden" }, /403/],
    ["a 404", { status: 404, error: null }, /404/],
    ["a 200 with an error set", { status: 200, error: "robots.txt disallows this URL" }, /robots\.txt disallows/],
    ["no status at all", { status: null, error: "fetch failed" }, /fetch failed/],
  ])("status: %s", (_label, meta, evidence) => {
    const r = classify({ meta, text: null, html: null });
    expect(r.kind).toBe("status");
    expect(r.evidence).toMatch(evidence);
  });

  it("a 2xx other than 200 is not a status flag by itself (EUR-Lex answers 202, the Knesset 247)", () => {
    expect(classify({ meta: { status: 202 } }).kind).toBe("ok");
  });

  it.each([
    ["Cloudflare's interstitial", page(SHORT).replace("<title>t</title>", "<title>Just a moment...</title>"), /Cloudflare/],
    ["Cloudflare's challenge platform", page(SHORT, '<script src="/cdn-cgi/challenge-platform/h/g/orchestrate/chl_page/v1"></script>'), /Cloudflare/],
    ["Imperva/Incapsula", page(SHORT, '<script src="/_Incapsula_Resource?SWJIYLWA=719d"></script>'), /Incapsula/],
    ["PerimeterX", page('<div id="px-captcha"></div>'), /PerimeterX/],
    ["DataDome", page(SHORT, '<script src="https://geo.captcha-delivery.com/captcha/"></script>'), /DataDome/],
    ["Radware Bot Manager", page(SHORT, '<script>var __uzdbm_1 = "x";</script>'), /Radware/],
    ["Reblaze", page("", '<script>window.rbzns={"seed":"x"};winsocks();</script>'), /Reblaze/],
    ["AWS WAF", page("", '<script src="https://abc.us-east-1.token.awswaf.com/abc/challenge.js"></script>'), /AWS WAF/],
    ["F5 BIG-IP", page("Please enable JavaScript to view the page content.", '<link rel="stylesheet" href="/TSPD/?type=25" />'), /F5/],
    ["Akamai", page('<div id="sec-if-cpt-container"></div>'), /Akamai/],
    ["challenge wording", page("<p>Please verify you are human to continue.</p>"), /wording/],
  ])("bot-challenge: %s with too little text", (_label, html, evidence) => {
    const r = classify({ text: SHORT, html });
    expect(r.kind).toBe("bot-challenge");
    expect(r.evidence).toMatch(evidence);
  });

  it("bot-challenge: a captcha widget alone on a short page with no sign of an app (a captcha page)", () => {
    const html = page('<p>Our systems need a check.</p><form><div class="g-recaptcha" data-sitekey="k"></div></form>');
    const r = classify({ text: "Our systems need a check.", html });
    expect(r.kind).toBe("bot-challenge");
    expect(r.evidence).toMatch(/reCAPTCHA/);
  });

  it("ok: a long page that merely embeds a captcha widget (a contact form), with the marker named in the evidence", () => {
    const html = page(`<p>${LONG}</p><form><div class="g-recaptcha" data-sitekey="k"></div></form>`, '<script src="https://www.google.com/recaptcha/api.js"></script>');
    const r = classify({ html });
    expect(r.kind).toBe("ok");
    expect(r.evidence).toMatch(/reCAPTCHA/);
  });

  it("ok: a long page behind a passive bot manager (Cloudflare's jsd script) is still a read page", () => {
    const html = page(`<p>${LONG}</p>`, "<script>a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js'</script>");
    const r = classify({ html });
    expect(r.kind).toBe("ok");
    expect(r.evidence).toMatch(/Cloudflare/);
  });

  it.each([
    ["a noscript notice", page('<noscript>You need to enable JavaScript to run this app.</noscript><div id="main"><p>Help</p></div>'), /noscript/],
    ["an empty app root", page('<div id="root"></div><script type="module" src="/assets/index.js"></script>'), /app root/],
    ["an app root holding only a style and a comment", page('<div id="app" data-csr="1"><style>.a{}</style><!-- ssr --></div>'), /app root/],
    ["an empty AngularJS view", page('<div ui-view>\n  </div><div id="fonts"><span>TEST</span></div>'), /app root/],
    ["a body of scripts only", page("<script>var a=1</script><script src=/x.js></script>"), /body/],
    ["state shipped for scripts", page('<div id="__next"><p>x</p></div><script id="__NEXT_DATA__" type="application/json">{}</script>'), /state/],
    ["a Salesforce loading box", page('<div class="auraMsgBox" id="auraLoadingBox"><span>Loading</span></div>'), /Salesforce/],
  ])("js-shell: too little text and %s", (_label, html, evidence) => {
    const r = classify({ text: SHORT, html });
    expect(r.kind).toBe("js-shell");
    expect(r.evidence).toMatch(evidence);
  });

  it("js-shell, not bot-challenge: an app shell that loads reCAPTCHA for its forms (the captcha is named, not decisive)", () => {
    const html = page('<div id="root"></div>', '<script src="https://www.google.com/recaptcha/api.js?render=KEY"></script>');
    const r = classify({ text: "App", html });
    expect(r.kind).toBe("js-shell");
    expect(r.evidence).toMatch(/reCAPTCHA/);
  });

  it("bot-challenge beats js-shell when a bot manager guards the shell, and the evidence names both", () => {
    const html = page('<div id="root"></div>', '<script>var __uzdbm_1 = "x";</script>');
    const r = classify({ text: "App", html });
    expect(r.kind).toBe("bot-challenge");
    expect(r.evidence).toMatch(/Radware/);
    expect(r.evidence).toMatch(/app root/);
  });

  it("short: too little text and no other sign", () => {
    const r = classify({ text: "A short but real forum post.", html: page("<article><p>A short but real forum post.</p></article>") });
    expect(r.kind).toBe("short");
    expect(r.evidence).toMatch(/fewer than/);
  });

  it("short: an HTML capture whose body was removed (bodyPath and textPath null)", () => {
    const r = classify({ meta: { bodyPath: null, textPath: null }, text: null, html: null });
    expect(r.kind).toBe("short");
    expect(r.evidence).toMatch(/no stored/);
  });

  it("a PDF is length-checked on its extracted text; with none it is short", () => {
    const pdf = { contentType: "application/pdf", bodyPath: "research/rendered/x.pdf" };
    expect(classify({ meta: pdf, html: null }).kind).toBe("ok");
    expect(classify({ meta: pdf, text: "scanned page", html: null }).kind).toBe("short");
    const none = classify({ meta: { ...pdf, textPath: null }, text: null, html: null });
    expect(none.kind).toBe("short");
    expect(none.evidence).toMatch(/no extracted text/);
  });

  it("a data capture (JSON, plain text, JavaScript) is not a page: ok, and the evidence says it was not text-checked", () => {
    for (const contentType of ["application/json; charset=utf-8", "text/plain", "application/javascript"]) {
      const r = classify({ meta: { contentType, bodyPath: "research/rendered/x.json", textPath: null }, text: null, html: null });
      expect(r.kind).toBe("ok");
      expect(r.evidence).toMatch(/not a page/);
    }
  });
});

describe("classifyCapture on the real committed captures", () => {
  const real = (slug: string) => classifyCapture(readCapture(slug, RENDERED));

  it("terms-israel-post (tick 31: 200, 4,375 bytes, judged refusal-type by hand) is a bot-challenge: Radware's bot manager and reCAPTCHA on an empty app root", () => {
    const r = real("terms-israel-post");
    expect(r.kind).toBe("bot-challenge");
    expect(r.evidence).toMatch(/Radware/);
    expect(r.evidence).toMatch(/reCAPTCHA/);
    expect(r.evidence).toMatch(/app root/);
  });

  it("Trolley's help centre (tick 15, a Salesforce shell) is a js-shell — its CSP names Google's reCAPTCHA host, which is not a challenge", () => {
    for (const slug of ["trolley-identity-verification-faq", "trolley-identity-verification"]) {
      const r = real(slug);
      expect(r.kind).toBe("js-shell");
      expect(r.evidence).toMatch(/Salesforce/);
    }
  });

  it("Medium's three 403s are status", () => {
    for (const slug of ["terms-medium", "terms-medium-rules", "terms-medium-ai-policy"]) {
      const r = real(slug);
      expect(r.kind).toBe("status");
      expect(r.evidence).toMatch(/403/);
    }
  });

  it("a long terms capture is ok (Trolley's terms of service, 56,457 characters)", () => {
    const r = real("trolley-terms-of-service");
    expect(r.kind).toBe("ok");
  });

  it("the other challenge pages in the store: the Knesset (Reblaze, status 247), EUR-Lex (AWS WAF, 202), UNESCO UIS (F5)", () => {
    expect(real("terms-knesset")).toMatchObject({ kind: "bot-challenge", evidence: expect.stringMatching(/Reblaze/) });
    expect(real("eu-dsa-2022-2065")).toMatchObject({ kind: "bot-challenge", evidence: expect.stringMatching(/AWS WAF/) });
    expect(real("unesco-uis-terms")).toMatchObject({ kind: "bot-challenge", evidence: expect.stringMatching(/F5/) });
  });

  it("Facer's terms are an AngularJS shell that loads reCAPTCHA v3: js-shell with the captcha named, not a challenge", () => {
    const r = real("facer-terms");
    expect(r.kind).toBe("js-shell");
    expect(r.evidence).toMatch(/reCAPTCHA/);
  });
});

describe("capture-check CLI", () => {
  const cli = (args: string[]) => {
    const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: "utf8" });
    return { code: r.status, stdout: r.stdout, stderr: r.stderr };
  };

  it("prints one line per capture (slug, kind, evidence) and exits 3 when any is flagged", () => {
    const r = cli(["terms-israel-post", "trolley-terms-of-service"]);
    expect(r.code).toBe(3);
    const lines = r.stdout.trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^terms-israel-post\tbot-challenge\t.+/);
    expect(lines[1]).toMatch(/^trolley-terms-of-service\tok\t.+/);
  });

  it("exits 0 when every capture named is ok", () => {
    expect(cli(["trolley-terms-of-service"]).code).toBe(0);
  });

  it.each([
    ["no arguments", []],
    ["a slug that is a path", ["../rendered/terms-medium"]],
    ["a missing capture", ["no-such-capture-anywhere"]],
    ["an unknown option", ["--write"]],
  ])("exits 2 on %s", (_label, args) => {
    const r = cli(args);
    expect(r.code).toBe(2);
    expect(r.stderr).not.toBe("");
  });

  it("--all reads every *.meta.json in research/rendered, one line each, and writes nothing", () => {
    const verdicts = join(ROOT, "research", "channel-loop", "terms-verdicts.json");
    const before = readFileSync(verdicts, "utf8");
    const r = cli(["--all"]);
    expect(r.code).toBe(3);
    const metas = readdirSync(RENDERED).filter((f) => f.endsWith(".meta.json"));
    expect(r.stdout.trim().split("\n")).toHaveLength(metas.length);
    expect(r.stderr).toMatch(/bot-challenge \d+/);
    expect(readFileSync(verdicts, "utf8")).toBe(before);
    expect(readFileSync(SCRIPT, "utf8")).not.toMatch(/writeFileSync|appendFileSync|renameSync|unlinkSync/);
  });

  describe("--dir (a capture directory other than research/rendered)", () => {
    const dir = mkdtempSync(join(tmpdir(), "capture-check-test-"));
    afterAll(() => rmSync(dir, { recursive: true, force: true }));
    const put = (slug: string, meta: Record<string, unknown>, files: Record<string, string>) => {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, `${slug}.meta.json`), JSON.stringify({ slug, ...meta }));
      for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
    };

    it("--all over a directory of read pages exits 0", () => {
      put("good", { ...OK_META, bodyPath: "research/rendered/good.html", textPath: "research/rendered/good.txt" }, { "good.html": page(`<p>${LONG}</p>`), "good.txt": LONG });
      const r = cli(["--dir", dir, "--all"]);
      expect(r.code).toBe(0);
      expect(r.stdout.trim()).toMatch(/^good\tok\t/);
    });

    it("a meta whose named text file is missing is a missing capture: exit 2", () => {
      put("broken", { ...OK_META, bodyPath: "research/rendered/broken.html", textPath: "research/rendered/broken.txt" }, { "broken.html": page("x") });
      const r = cli(["--dir", dir, "broken"]);
      expect(r.code).toBe(2);
      expect(r.stderr).toMatch(/broken\.txt/);
    });
  });
});
