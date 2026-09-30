import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design (same as queue-zero-test.mjs)
import { classifyCapture, readCapture, WEAK_SIGN_TEXT } from "../../../scripts/capture-check.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { MIN_TERMS_TEXT } from "../../../scripts/queue-zero-test.mjs";

/**
 * scripts/capture-check.mjs flags render-watch captures the reader should not take as read pages: a fetch the server
 * refused or nobody answered ("status"), a challenge page ("bot-challenge"), a page that needs JavaScript to show its
 * text ("js-shell"), or too little text with no other sign ("short"). "Too little" is queue-zero-test's MIN_TERMS_TEXT,
 * counted in the same <slug>.txt queue-zero-test reads. It only flags: it writes nothing and judges nothing (ruling
 * 16(d) D2(iv) — a site's refusal, including a bot challenge, is its answer — is applied by the reader).
 *
 * The review of tick 33 asked that every marker alternative and status bound be guarded by a test: each alternative has
 * its own synthetic case below, so breaking any one of them fails one.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "capture-check.mjs");
const RENDERED = join(ROOT, "research", "rendered");

const OK_META = { status: 200, error: null, contentType: "text/html; charset=utf-8", bodyPath: "research/rendered/x.html", textPath: "research/rendered/x.txt" };
const LONG = "Terms of service. ".repeat(100); // 1,800 characters
const SHORT = "Loading";
const page = (body: string, head = "") => `<!doctype html><html><head><title>t</title>${head}</head><body>${body}</body></html>`;
const classify = (over: { meta?: Record<string, unknown>; text?: string | null; html?: string | null; textFrom?: string }) =>
  classifyCapture({
    meta: { ...OK_META, ...(over.meta ?? {}) },
    text: over.text === undefined ? LONG : over.text,
    html: over.html === undefined ? page("<p>x</p>") : over.html,
    textFrom: over.textFrom,
  });

describe("classifyCapture: ok, the threshold, and status", () => {
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

  // A status says who answered: the server (and what), or nobody. "Never fetched" was wrong for a 403: the server
  // answered, and that answer is the refusal research/rendered/README.md tells the reader to write down.
  it.each([
    ["a 403 with its error", { status: 403, error: "HTTP 403 Forbidden" }, /the server answered 403 \(refused\).*HTTP 403 Forbidden/],
    ["a 406", { status: 406, error: "HTTP 406 Not Acceptable" }, /the server answered 406 \(refused\)/],
    ["a 400 (TikTok's oEmbed)", { status: 400, error: "HTTP 400 Bad Request" }, /the server answered 400 \(refused\)/],
    ["a 300 with no error", { status: 300, error: null }, /the server answered 300 \(a redirect, not followed\)/],
    ["a 404 with no error", { status: 404, error: null }, /the server answered 404 \(not found\)/],
    ["a 410", { status: 410, error: null }, /the server answered 410 \(not found\)/],
    ["a 503", { status: 503, error: "HTTP 503 Service Unavailable" }, /the server answered 503 \(a server error\)/],
    ["a 301 with no error", { status: 301, error: null }, /the server answered 301 \(a redirect, not followed\)/],
    ["a 302 with no error", { status: 302, error: null }, /the server answered 302 \(a redirect, not followed\)/],
    ["a 399 with no error", { status: 399, error: null }, /the server answered 399 \(a redirect, not followed\)/],
    ["a 101 with no error", { status: 101, error: null }, /the server answered 101 \(not a final answer\)/],
    ["a 199 with no error", { status: 199, error: null }, /the server answered 199 \(not a final answer\)/],
    ["a 200 with an error set", { status: 200, error: "robots.txt disallows this URL" }, /status 200: the server answered, but the fetch recorded an error.*robots\.txt disallows/],
    ["no status at all", { status: null, error: "fetch failed" }, /no answer \(the fetch failed, or was not sent\).*fetch failed/],
  ])("status: %s", (_label, meta, evidence) => {
    const r = classify({ meta, text: null, html: null });
    expect(r.kind).toBe("status");
    expect(r.evidence).toMatch(evidence);
    expect(r.evidence).not.toMatch(/never fetched|older capture/);
  });

  it("a 2xx other than 200 is not a status flag by itself (EUR-Lex answers 202, the Knesset 247), nor are 200 and 299", () => {
    for (const status of [200, 202, 247, 299]) expect(classify({ meta: { status } }).kind).toBe("ok");
  });

  it("status: an older capture's text still on disk beside a failed fetch is named, with its length", () => {
    const meta = { status: 503, error: "HTTP 503 Service Unavailable", bodyPath: null, textPath: null };
    const r = classify({ meta, text: `  ${LONG}  `, html: null, textFrom: "beside" });
    expect(r.kind).toBe("status");
    expect(r.evidence).toContain(`an older capture's text is still on disk (${LONG.trim().length} characters`);
  });
});

describe("classifyCapture: challenge pages decide; sensors and captchas on app pages are only named", () => {
  // One case per alternative of each challenge-page marker.
  it.each([
    ["Cloudflare: its challenge-platform orchestrate script", page(SHORT, '<script src="/cdn-cgi/challenge-platform/h/g/orchestrate/chl_page/v1?ray=1"></script>'), /Cloudflare challenge page/],
    ["Cloudflare: the 'Just a moment...' title", page(SHORT).replace("<title>t</title>", "<title>Just a moment...</title>"), /Cloudflare challenge page/],
    ["Cloudflare: cf_chl_opt", page(SHORT, "<script>window._cf_chl_opt={cvId:'3'};</script>"), /Cloudflare challenge page/],
    ["Cloudflare: cf-browser-verification", page('<div class="cf-browser-verification cf-im-under-attack"></div>'), /Cloudflare challenge page/],
    ["Imperva: the incident page", page("<iframe>Request unsuccessful. Incapsula incident ID: 1-2</iframe>"), /Imperva\/Incapsula incident page/],
    ["PerimeterX: the px-captcha box", page('<div id="px-captcha"></div>'), /PerimeterX \(HUMAN\) captcha/],
    ["PerimeterX: its captcha script", page(SHORT, '<script src="https://captcha.px-cdn.net/PXabc/captcha.js"></script>'), /PerimeterX \(HUMAN\) captcha/],
    ["DataDome: its captcha host", page(SHORT, '<script src="https://geo.captcha-delivery.com/captcha/"></script>'), /DataDome captcha/],
    ["Reblaze: the seed script over an empty body", page("", '<script>window.rbzns={"seed":"x"};winsocks();</script>'), /Reblaze challenge/],
    ["AWS WAF: the challenge container", page('<div id="challenge-container"></div>'), /AWS WAF challenge page/],
    ["AWS WAF: the getToken reload", page("<script>AwsWafIntegration.getToken().then(() => location.reload(true));</script>"), /AWS WAF challenge page/],
    ["F5 BIG-IP: the support ID", page("Please enable JavaScript to view the page content.<br/>Your support ID is: 1782913578710", '<link rel="stylesheet" href="/TSPD/?type=25" />'), /F5 BIG-IP support-ID page/],
    ["Akamai: the cp_challenge path", page(SHORT, '<script src="/_sec/cp_challenge/sec-4-4.js"></script>'), /Akamai challenge page/],
    ["Akamai: the challenge container", page('<div id="sec-if-cpt-container"></div>'), /Akamai challenge page/],
    ["wording: verify you are human", page("<p>Please verify you are human to continue.</p>"), /challenge wording/],
    ["wording: verify that you're not a robot", page("<p>we need to verify that you're not a robot</p>"), /challenge wording/],
    ["wording: checking your browser", page("<p>Checking your browser before accessing example.com</p>"), /challenge wording/],
    ["wording: checking the connection", page("<p>Checking if the site connection is secure</p>"), /challenge wording/],
    ["wording: unusual traffic", page("<p>Our systems have detected unusual traffic from your computer network.</p>"), /challenge wording/],
  ])("bot-challenge: %s, with too little text", (_label, html, evidence) => {
    const r = classify({ text: SHORT, html });
    expect(r.kind).toBe("bot-challenge");
    expect(r.evidence).toMatch(evidence);
  });

  it("Reblaze's seed on a page that has a body is only a sensor, not a challenge", () => {
    const r = classify({ text: SHORT, html: page("<p>Loading</p>", '<script>window.rbzns={"seed":"x"};</script>') });
    expect(r.kind).toBe("short");
    expect(r.evidence).toMatch(/also Reblaze seed or cookie/);
  });

  it("a challenge page's own marker beats js-shell, and the evidence names both", () => {
    const html = page('<div id="root"></div>', '<script src="/cdn-cgi/challenge-platform/h/b/orchestrate/managed/v1?ray=1"></script>');
    const r = classify({ text: "App", html });
    expect(r.kind).toBe("bot-challenge");
    expect(r.evidence).toMatch(/Cloudflare challenge page/);
    expect(r.evidence).toMatch(/also empty app root/);
  });

  // Passive sensors: sites load them on ordinary pages (mr.gov.il's storefront, 1,176 characters, carries the same
  // Radware connector as Israel Post's terms). One case per alternative: on a short page with no other sign they are
  // named and the page is "short"; on an app shell it is "js-shell"; on a long page, "ok". Never a challenge.
  it.each([
    ["Cloudflare's jsd script", "<script>a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js'</script>", /Cloudflare bot script/],
    ["Cloudflare's jsd script under h/b/", "<script>a.src='/cdn-cgi/challenge-platform/h/b/scripts/jsd/13c98df4ef2d/main.js'</script>", /Cloudflare bot script/],
    ["Imperva's resource script", '<script src="/_Incapsula_Resource?SWJIYLWA=719d"></script>', /Imperva\/Incapsula script/],
    ["PerimeterX's app id", '<script>window._pxAppId="PXabc";</script>', /PerimeterX \(HUMAN\) sensor/],
    ["PerimeterX's sensor host", '<script src="https://client.perimeterx.net/PXabc/main.min.js"></script>', /PerimeterX \(HUMAN\) sensor/],
    ["DataDome's tag", '<script src="https://js.datadome.co/tags.js"></script>', /DataDome tag/],
    ["Radware's __uzdbm_ variable", '<script>var __uzdbm_1 = "x";</script>', /Radware Bot Manager/],
    ["Radware's validate host", '<script>ssConf("cu","validate.perfdrive.com");</script>', /Radware Bot Manager/],
    ["ShieldSquare", '<script src="https://cdn.shieldsquare.com/x.js"></script>', /Radware Bot Manager/],
    ["Reblaze's seed", '<script>window.rbzns={"seed":"x"};</script>', /Reblaze seed or cookie/],
    ["Reblaze's cookie", "<script>document.cookie='rbzid=1';</script>", /Reblaze seed or cookie/],
    ["AWS WAF's SDK host", '<script src="https://abc.us-east-1.token.awswaf.com/abc/challenge.js"></script>', /AWS WAF script/],
    ["AWS WAF's SDK object", "<script>AwsWafIntegration.saveReferrer();</script>", /AWS WAF script/],
    ["F5's TSPD script by id", '<script src="/TSPD/080713870fab200046c99261f3a8f0be"></script>', /F5 BIG-IP bot defense script/],
    ["F5's TSPD script by type", '<link rel="stylesheet" href="/TSPD/?type=25" />', /F5 BIG-IP bot defense script/],
  ])("a passive sensor is named, never decisive: %s", (_label, head, name) => {
    const plain = classify({ text: SHORT, html: page("<p>Loading</p>", head) });
    expect(plain.kind).toBe("short");
    expect(plain.evidence).toMatch(new RegExp(`also ${name.source}`));
    const shell = classify({ text: SHORT, html: page('<div id="root"></div>', head) });
    expect(shell.kind).toBe("js-shell");
    expect(shell.evidence).toMatch(/app root/);
    expect(shell.evidence).toMatch(new RegExp(`also ${name.source}`));
    const long = classify({ html: page(`<p>${LONG}</p>`, head) });
    expect(long.kind).toBe("ok");
    expect(long.evidence).toMatch(name);
  });

  // One case per captcha alternative: alone on a short page with no sign of an app, a captcha page.
  it.each([
    ["reCAPTCHA's api.js", '<script src="https://www.google.com/recaptcha/api.js"></script>', "", /reCAPTCHA/],
    ["reCAPTCHA's enterprise.js on recaptcha.net", '<script src="https://www.recaptcha.net/recaptcha/enterprise.js"></script>', "", /reCAPTCHA/],
    ["reCAPTCHA's widget class", "", '<div class="g-recaptcha" data-sitekey="k"></div>', /reCAPTCHA/],
    ["hCaptcha's api.js", '<script src="https://hcaptcha.com/1/api.js" async defer></script>', "", /hCaptcha/],
    ["hCaptcha's widget class", "", '<div class="h-captcha" data-sitekey="k"></div>', /hCaptcha/],
    ["Turnstile's script", '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>', "", /Cloudflare Turnstile/],
    ["Turnstile's widget class", "", '<div class="cf-turnstile" data-sitekey="k"></div>', /Cloudflare Turnstile/],
  ])("bot-challenge: %s alone on a short page with no sign of an app", (_label, head, widget, name) => {
    const html = page(`<p>Our systems need a check.</p><form>${widget}</form>`, head);
    const r = classify({ text: "Our systems need a check.", html });
    expect(r.kind).toBe("bot-challenge");
    expect(r.evidence).toMatch(name);
  });

  it("ok: a long page that merely embeds a captcha widget (a contact form), with the marker named in the evidence", () => {
    const html = page(`<p>${LONG}</p><form><div class="g-recaptcha" data-sitekey="k"></div></form>`, '<script src="https://www.google.com/recaptcha/api.js"></script>');
    const r = classify({ html });
    expect(r.kind).toBe("ok");
    expect(r.evidence).toMatch(/reCAPTCHA/);
  });

  it("a Content-Security-Policy naming reCAPTCHA's host is not a captcha (Trolley's help centre)", () => {
    const html = page("<p>Loading</p>", '<meta http-equiv="Content-Security-Policy" content="script-src https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/">');
    const r = classify({ text: SHORT, html });
    expect(r.kind).toBe("short");
    expect(r.evidence).not.toMatch(/reCAPTCHA/);
  });

  it("js-shell, not bot-challenge: an app shell that loads reCAPTCHA for its forms (the captcha is named, not decisive)", () => {
    const html = page('<div id="root"></div>', '<script src="https://www.google.com/recaptcha/api.js?render=KEY"></script>');
    const r = classify({ text: "App", html });
    expect(r.kind).toBe("js-shell");
    expect(r.evidence).toMatch(/also reCAPTCHA/);
  });

  it("a passive sensor guarding a shell does not make it a challenge (Israel Post's case): js-shell, the sensor named", () => {
    const html = page('<div id="root"></div>', '<script>var __uzdbm_1 = "x";</script><script src="https://www.google.com/recaptcha/api.js?render=KEY"></script>');
    const r = classify({ text: "App", html });
    expect(r.kind).toBe("js-shell");
    expect(r.evidence).toMatch(/also Radware/);
    expect(r.evidence).toMatch(/also reCAPTCHA/);
  });
});

describe("classifyCapture: JavaScript shells", () => {
  it.each([
    ["an empty app root", page('<div id="root"></div><script type="module" src="/assets/index.js"></script>'), /app root/],
    ["an app root holding only a style and a comment", page('<div id="app" data-csr="1"><style>.a{}</style><!-- ssr --></div>'), /app root/],
    ["an empty AngularJS view", page('<div ui-view>\n  </div><div id="fonts"><span>TEST</span></div>'), /app root/],
    ["a body of scripts only", page("<script>var a=1</script><script src=/x.js></script>"), /body/],
    ["a Salesforce loading box", page('<div class="auraMsgBox" id="auraLoadingBox"><span>Loading</span></div>'), /Salesforce/],
  ])("js-shell: %s is a strong sign, at any length under the threshold", (_label, html, evidence) => {
    for (const text of [SHORT, "x".repeat(MIN_TERMS_TEXT - 1)]) {
      const r = classify({ text, html });
      expect(r.kind).toBe("js-shell");
      expect(r.evidence).toMatch(evidence);
    }
  });

  // Weak signs are framework markup that server-rendered pages carry too: PayPal's help index (726 characters of real
  // links) has the stock noscript notice and __NEXT_DATA__. They mark a shell only under WEAK_SIGN_TEXT characters.
  it.each([
    ["a noscript notice", page('<noscript>You need to enable JavaScript to run this app.</noscript><div id="main"><p>Help</p></div>'), /noscript/],
    ["Next.js state", page('<div id="__next"><p>x</p></div><script id="__NEXT_DATA__" type="application/json">{}</script>'), /page state/],
    ["Meta's server JS (data-sjs)", page('<script type="application/json" data-content-len="82" data-sjs>{"require":[]}</script><p>x</p>'), /page state/],
    ["a React streaming placeholder", page('<!--$?--><template id="B:0"></template><p>Loading</p>'), /React streaming placeholder/],
    ["a splash screen", page('<div id="splash-screen" style="position:fixed"></div><p>x</p>'), /splash screen/],
  ])("a weak sign, %s: js-shell with very little text, short (the sign named) with more", (_label, html, evidence) => {
    const shell = classify({ text: "a".repeat(WEAK_SIGN_TEXT - 1), html });
    expect(shell.kind).toBe("js-shell");
    expect(shell.evidence).toMatch(evidence);
    const served = classify({ text: "a".repeat(WEAK_SIGN_TEXT), html });
    expect(served.kind).toBe("short");
    expect(served.evidence).toMatch(new RegExp(`also ${evidence.source}.*not taken as a shell`));
  });

  it("a weak sign still counts as a sign of an app for a captcha: a captcha on a server-rendered app page is not a captcha page", () => {
    const html = page('<noscript>You need to enable JavaScript to run this app.</noscript><form><div class="g-recaptcha"></div></form>');
    const r = classify({ text: "a".repeat(WEAK_SIGN_TEXT + 10), html });
    expect(r.kind).toBe("short");
    expect(r.evidence).toMatch(/also reCAPTCHA/);
  });
});

describe("classifyCapture: short, and what counts as a page", () => {
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

  it("a PDF is length-checked on its text; with none it is short", () => {
    const pdf = { contentType: "application/pdf", bodyPath: "research/rendered/x.pdf" };
    expect(classify({ meta: pdf, html: null }).kind).toBe("ok");
    expect(classify({ meta: pdf, text: "scanned page", html: null }).kind).toBe("short");
    const none = classify({ meta: { ...pdf, textPath: null }, text: null, html: null });
    expect(none.kind).toBe("short");
    expect(none.evidence).toMatch(/no text \(textPath null, and no \.txt beside/);
  });

  it("a PDF's hand extraction beside it (textPath null) is length-checked, and the evidence says it is not the fetcher's", () => {
    const pdf = { contentType: "application/pdf", bodyPath: "research/rendered/x.pdf", textPath: null };
    const r = classify({ meta: pdf, text: LONG, html: null, textFrom: "beside" });
    expect(r.kind).toBe("ok");
    expect(r.evidence).toMatch(/in the \.txt beside the PDF, not the fetcher's \(textPath null: a hand extraction/);
  });

  it("a plain-text capture is a page: length-checked (a raw GitHub copy whose body is '404: Not Found' is short)", () => {
    const plain = { contentType: "text/plain; charset=utf-8", bodyPath: "research/rendered/x.txt", textPath: "research/rendered/x.txt" };
    const r = classify({ meta: plain, text: "404: Not Found", html: null });
    expect(r.kind).toBe("short");
    expect(r.evidence).toMatch(/^14 characters of text, fewer than/);
    expect(classify({ meta: plain, text: LONG, html: null }).kind).toBe("ok");
    const body = classify({ meta: { ...plain, textPath: null }, text: LONG, html: null, textFrom: "body" });
    expect(body).toMatchObject({ kind: "ok", evidence: expect.stringMatching(/\(the body itself\)/) });
  });

  it("a data capture (JSON, JavaScript) is not a page: ok, and the evidence says it was not text-checked", () => {
    for (const contentType of ["application/json; charset=utf-8", "application/rdap+json", "application/javascript", "text/javascript"]) {
      const r = classify({ meta: { contentType, bodyPath: "research/rendered/x.json", textPath: null }, text: null, html: null });
      expect(r.kind).toBe("ok");
      expect(r.evidence).toMatch(/not a page/);
    }
  });
});

describe("classifyCapture on the real committed captures", () => {
  const real = (slug: string) => classifyCapture(readCapture(slug, RENDERED));

  it("terms-israel-post (tick 31: 200, 4,375 bytes, a React index.html) is a js-shell: an empty app root, with Radware's connector and reCAPTCHA v3 named, not a challenge page", () => {
    const r = real("terms-israel-post");
    expect(r.kind).toBe("js-shell");
    expect(r.evidence).toMatch(/empty app root/);
    expect(r.evidence).toMatch(/also Radware/);
    expect(r.evidence).toMatch(/also reCAPTCHA/);
  });

  it("irs-us-israel-treaty (the US-Israel tax treaty PDF) is ok on the hand text beside it, and says whose text it is", () => {
    const capture = readCapture("irs-us-israel-treaty", RENDERED);
    expect(capture.textFrom).toBe("beside");
    const r = classifyCapture(capture);
    expect(r.kind).toBe("ok");
    expect(r.evidence).toMatch(/beside the PDF, not the fetcher's/);
  });

  it("Trolley's help centre (tick 15, a Salesforce shell) is a js-shell — its CSP names Google's reCAPTCHA host, which is not a challenge", () => {
    for (const slug of ["trolley-identity-verification-faq", "trolley-identity-verification"]) {
      const r = real(slug);
      expect(r.kind).toBe("js-shell");
      expect(r.evidence).toMatch(/Salesforce/);
    }
  });

  it("Medium's three 403s are status: the server answered 403", () => {
    for (const slug of ["terms-medium", "terms-medium-rules", "terms-medium-ai-policy"]) {
      const r = real(slug);
      expect(r.kind).toBe("status");
      expect(r.evidence).toMatch(/the server answered 403 \(refused\)/);
    }
  });

  it("a long terms capture is ok (Trolley's terms of service, 56,457 characters)", () => {
    const r = real("trolley-terms-of-service");
    expect(r.kind).toBe("ok");
  });

  it("the other challenge pages in the store: the Knesset (Reblaze, status 247), EUR-Lex (AWS WAF, 202), UNESCO UIS (F5)", () => {
    expect(real("terms-knesset")).toMatchObject({ kind: "bot-challenge", evidence: expect.stringMatching(/Reblaze challenge/) });
    expect(real("eu-dsa-2022-2065")).toMatchObject({ kind: "bot-challenge", evidence: expect.stringMatching(/AWS WAF challenge page/) });
    expect(real("unesco-uis-terms")).toMatchObject({ kind: "bot-challenge", evidence: expect.stringMatching(/F5 BIG-IP support-ID page/) });
  });

  it("Facer's terms are an AngularJS shell that loads reCAPTCHA v3: js-shell with the captcha named, not a challenge", () => {
    const r = real("facer-terms");
    expect(r.kind).toBe("js-shell");
    expect(r.evidence).toMatch(/also reCAPTCHA/);
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
    expect(lines[0]).toMatch(/^terms-israel-post\tjs-shell\t.+/);
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

    it("reads <slug>.txt when the meta names no text, as queue-zero-test does, and says whose text it is", () => {
      put("handpdf", { ...OK_META, contentType: "application/pdf", bodyPath: "research/rendered/handpdf.pdf", textPath: null }, { "handpdf.pdf": "%PDF-1.4", "handpdf.txt": LONG });
      put("gone", { ...OK_META, status: 503, error: "HTTP 503 Service Unavailable", bodyPath: null, textPath: null }, { "gone.txt": LONG, "gone.html": page(LONG) });
      put("plainbody", { ...OK_META, contentType: "text/plain", bodyPath: "research/rendered/plainbody.txt", textPath: null }, { "plainbody.txt": "User-agent: *" });
      const r = cli(["--dir", dir, "handpdf", "gone", "plainbody"]);
      expect(r.code).toBe(3);
      const [pdf, gone, plain] = r.stdout.trim().split("\n");
      expect(pdf).toMatch(/^handpdf\tok\t.*beside the PDF, not the fetcher's/);
      expect(gone).toMatch(/^gone\tstatus\t.*the server answered 503.*an older capture's text is still on disk/);
      expect(plain).toMatch(/^plainbody\tshort\t13 characters of text \(the body itself\)/);
    });

    it("a meta whose named text file is missing is a missing capture: exit 2", () => {
      put("broken", { ...OK_META, bodyPath: "research/rendered/broken.html", textPath: "research/rendered/broken.txt" }, { "broken.html": page("x") });
      const r = cli(["--dir", dir, "broken"]);
      expect(r.code).toBe(2);
      expect(r.stderr).toMatch(/broken\.txt/);
    });
  });
});
