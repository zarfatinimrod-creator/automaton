import { createRequire } from "node:module";
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp, defaultPaywall } from "../src/app.js";
import { buildPaywall, PaywallConfigError, probeFacilitator, type ModuleLoader } from "../src/app.js";
import { formatUsd, normaliseNetwork, parsePriceUsd, priceList, validatePayTo, type FacilitatorLike } from "../src/config.js";
import { loadConfig } from "../src/config.js";

const freeApp = () => createApp({ config: loadConfig({} as NodeJS.ProcessEnv) });

describe("free/discovery endpoints", () => {
  it("reports health and free mode", async () => {
    const res = await request(freeApp()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok", paywall: "free" });
  });

  it("publishes a price list agents can discover", async () => {
    for (const path of ["/pricing", "/.well-known/x402.json"]) {
      const res = await request(freeApp()).get(path);
      expect(res.status).toBe(200);
      expect(res.body.endpoints.length).toBeGreaterThanOrEqual(6);
      expect(res.body.endpoints[0].price).toMatch(/^\$/);
      expect(res.body.payTo).toBeNull();
    }
  });

  it("404s unknown paths with a pointer to pricing", async () => {
    const res = await request(freeApp()).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.message).toContain("/pricing");
  });
});

describe("billable endpoints in free mode", () => {
  it("validates an Israeli ID", async () => {
    const app = freeApp();
    const ok = await request(app).post("/v1/validate/israeli-id").send({ id: "000000018" });
    expect(ok.body).toMatchObject({ valid: true, normalized: "000000018" });
    const bad = await request(app).post("/v1/validate/israeli-id").send({ id: "000000019" });
    expect(bad.body.valid).toBe(false);
    const missing = await request(app).post("/v1/validate/israeli-id").send({});
    expect(missing.status).toBe(400);
  });

  it("validates and normalises phone numbers", async () => {
    const res = await request(freeApp()).post("/v1/validate/phone").send({ phone: "+972 50-123-4567" });
    expect(res.body).toMatchObject({ valid: true, type: "mobile", e164: "+972501234567" });
    const land = await request(freeApp()).post("/v1/validate/phone").send({ phone: "03-1234567" });
    expect(land.body.type).toBe("landline");
  });

  it("checks bank details by format and names the bank", async () => {
    const ok = await request(freeApp()).post("/v1/validate/bank").send({ bank: "12", branch: "600", account: "123456" });
    expect(ok.body).toMatchObject({ valid: true, bankName: "Bank Hapoalim", branch: "600" });
    expect(ok.body.note).toContain("Format check only");
    const bad = await request(freeApp()).post("/v1/validate/bank").send({ bank: "999", branch: "1", account: "12345" });
    expect(bad.body.valid).toBe(false);
  });

  it("converts Gregorian to Hebrew dates and rejects bad input", async () => {
    const res = await request(freeApp()).get("/v1/hebrew-date?date=2025-09-23");
    expect(res.body).toMatchObject({ year: 5786, day: 1, month: "Tishrei" });
    const today = await request(freeApp()).get("/v1/hebrew-date");
    expect(today.status).toBe(200);
    const bad = await request(freeApp()).get("/v1/hebrew-date?date=2026-02-30");
    expect(bad.status).toBe(400);
  });

  it("transliterates Hebrew", async () => {
    const res = await request(freeApp()).post("/v1/transliterate").send({ text: "שלום עולם" });
    expect(res.body.latin).toBe("shlvm 'vlm");
    expect(res.body.note).toContain("approximate");
    expect((await request(freeApp()).post("/v1/transliterate").send({})).status).toBe(400);
  });

  it("repairs malformed JSON from a field or a raw body", async () => {
    const res = await request(freeApp()).post("/v1/json/repair").send({ json: "{name: 'x', ok: True,}" });
    expect(res.body.parsed).toEqual({ name: "x", ok: true });
    expect(res.body.changed).toBe(true);
    const raw = await request(freeApp()).post("/v1/json/repair").set("Content-Type", "text/plain").send('{a:1}');
    expect(raw.body.parsed).toEqual({ a: 1 });
    expect((await request(freeApp()).post("/v1/json/repair").send({})).status).toBe(400);
  });
});

describe("paywalled mode", () => {
  const paidConfig = loadConfig({ X402_PAY_TO: "0x1111111111111111111111111111111111111111", X402_NETWORK: "base" } as NodeJS.ProcessEnv);

  it("prices six billable routes, JSON repair at double, all above the facilitator's per-settlement fee", () => {
    const entries = priceList(paidConfig);
    expect(entries).toHaveLength(6);
    expect(paidConfig.paywallEnabled).toBe(true);
    expect(paidConfig.defaultPriceUsd).toBeGreaterThan(0.001);
    expect(entries.find((e) => e.path === "/v1/json/repair")?.priceUsd).toBe(paidConfig.defaultPriceUsd * 2);
  });

  it("returns the 402 challenge produced by the middleware and leaves discovery free", async () => {
    const app = createApp({
      config: paidConfig,
      paywall: () => (req, res, next) => {
        if (!req.path.startsWith("/v1/")) return next();
        if (req.get("X-PAYMENT")) return next();
        return res.status(402).json({
          x402Version: 2,
          accepts: [{ scheme: "exact", network: "eip155:8453", payTo: paidConfig.payTo, amount: "2000", asset: "USDC" }],
        });
      },
    });
    const challenge = await request(app).post("/v1/validate/israeli-id").send({ id: "000000018" });
    expect(challenge.status).toBe(402);
    expect(challenge.body.accepts[0].payTo).toBe(paidConfig.payTo);

    const paid = await request(app).post("/v1/validate/israeli-id").set("X-PAYMENT", "proof").send({ id: "000000018" });
    expect(paid.status).toBe(200);
    expect(paid.body.valid).toBe(true);

    const health = await request(app).get("/health");
    expect(health.status).toBe(200);
    expect(health.body.paywall).toBe("x402");
  });

  it("fails closed on /v1 when the x402 middleware cannot be loaded", async () => {
    const app = createApp({
      config: paidConfig,
      paywall: () => (req, res, next) => {
        if (req.path.startsWith("/v1/")) return res.status(503).json({ error: "payment_unavailable" });
        return next();
      },
    });
    const res = await request(app).post("/v1/validate/phone").send({ phone: "0501234567" });
    expect(res.status).toBe(503);
  });
});

// These exercise defaultPaywall ITSELF, not an injected mock. The mocked tests
// above cannot catch a fault inside the real factory — and did not catch that it
// used `require` in an ES module, which silently downgraded every paid endpoint
// to a 503.
//
// x402 v2 will not build a 402 until it has asked the facilitator which
// (scheme, network) pairs it supports, so the one thing stubbed here is that
// network hop. Everything else — the real middleware, the real EVM scheme, the
// real price-to-USDC conversion, the real route matching, the real verify and
// settle sequencing — runs for real.
const PAY_TO = "0x1111111111111111111111111111111111111111";
const BASE = "eip155:8453";

/** v2 carries the requirements in a base64 JSON header, not the body. */
const paymentRequired = (res: { headers: Record<string, string | string[] | undefined> }) => {
  const raw = res.headers["payment-required"];
  expect(raw, "PAYMENT-REQUIRED header must be present on a 402").toBeTruthy();
  return JSON.parse(Buffer.from(String(raw), "base64").toString("utf8"));
};
const decodeHeader = (raw: string | string[] | undefined) =>
  raw ? JSON.parse(Buffer.from(String(raw), "base64").toString("utf8")) : undefined;
/** A v2 payment that echoes the server's own requirements back, the way a real client does. */
const paymentFor = (accepted: unknown, mutate: (a: Record<string, unknown>) => void = () => {}) => {
  const copy = JSON.parse(JSON.stringify(accepted)) as Record<string, unknown>;
  mutate(copy);
  return Buffer.from(JSON.stringify({
    x402Version: 2,
    accepted: copy,
    payload: { signature: "0xstub", authorization: { from: PAY_TO, to: PAY_TO, value: copy.amount } },
  })).toString("base64");
};

type StubCalls = { verify: unknown[][]; settle: unknown[][] };
const facilitatorStub = (overrides: Partial<FacilitatorLike> = {}, calls: StubCalls = { verify: [], settle: [] }): FacilitatorLike => ({
  getSupported: async () => ({
    kinds: [{ x402Version: 2, scheme: "exact", network: BASE }],
    extensions: [],
    signers: {},
  }),
  verify: async (...args) => { calls.verify.push(args); return { isValid: false, invalidReason: "stub_rejects_everything" }; },
  settle: async (...args) => { calls.settle.push(args); return { success: false, errorReason: "stub", transaction: "", network: BASE }; },
  ...overrides,
});

describe("defaultPaywall (the real production path)", () => {
  const paidConfig = {
    ...loadConfig({ X402_PAY_TO: PAY_TO, X402_NETWORK: "base" } as NodeJS.ProcessEnv),
    facilitatorClient: facilitatorStub(),
  };

  it("returns null in free mode so nothing is paywalled", () => {
    expect(defaultPaywall(loadConfig({} as NodeJS.ProcessEnv))).toBeNull();
  });

  it("loads the @x402 packages and builds real middleware, not the fail-closed fallback", async () => {
    const middleware = defaultPaywall(paidConfig);
    expect(typeof middleware).toBe("function");
    // The fallback also has typeof "function"; only a 402 with the v2 header proves the real thing loaded.
    const app = createApp({ config: paidConfig });
    const res = await request(app).post("/v1/validate/israeli-id").send({ id: "000000018" });
    expect(res.status).toBe(402);
    expect(res.headers["payment-required"]).toBeTruthy();
  });

  it("challenges an unpaid request on every billable route with the advertised amount", async () => {
    const app = createApp({ config: paidConfig });
    for (const entry of priceList(paidConfig)) {
      const res = entry.method === "GET"
        ? await request(app).get(entry.path)
        : await request(app).post(entry.path).send({});
      expect(res.status, `${entry.method} ${entry.path}`).toBe(402);
      expect(res.body.error).toBe("payment_required");
      expect(res.body.pricing).toBe("/pricing");
      const required = paymentRequired(res);
      expect(required.x402Version).toBe(2);
      expect(required.accepts).toHaveLength(1);
      const req = required.accepts[0];
      expect(req.scheme).toBe("exact");
      expect(req.network).toBe(BASE);
      expect(req.payTo).toBe(PAY_TO);
      // The amount is atomic USDC (6 decimals). If this ever reads "0" or "2",
      // the price conversion silently gave the endpoint away or overcharged.
      expect(req.amount).toBe(String(Math.round(entry.priceUsd * 1e6)));
      expect(req.asset).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
  });

  it("also paywalls HEAD on a paid GET route, which Express would otherwise serve", async () => {
    const app = createApp({ config: paidConfig });
    const res = await request(app).head("/v1/hebrew-date?date=2026-09-05");
    expect(res.status).toBe(402);
  });

  it("rejects a malformed payment header before the facilitator is consulted", async () => {
    const calls: StubCalls = { verify: [], settle: [] };
    const app = createApp({ config: { ...paidConfig, facilitatorClient: facilitatorStub({}, calls) } });
    for (const header of ["payment-signature", "x-payment"]) {
      const res = await request(app)
        .post("/v1/validate/israeli-id")
        .set(header, "definitely-not-a-signed-payment")
        .send({ id: "000000018" });
      expect(res.status, `${header} must not unlock the route`).toBe(402);
      expect(res.body.valid).toBeUndefined();
    }
    expect(calls.verify).toHaveLength(0);
  });

  it("asks the facilitator to verify a well-formed payment, and a rejection stays a 402", async () => {
    const calls: StubCalls = { verify: [], settle: [] };
    const app = createApp({ config: { ...paidConfig, facilitatorClient: facilitatorStub({}, calls) } });
    const challenge = await request(app).post("/v1/validate/israeli-id").send({ id: "000000018" });
    const accepted = paymentRequired(challenge).accepts[0];

    const res = await request(app)
      .post("/v1/validate/israeli-id")
      .set("payment-signature", paymentFor(accepted))
      .send({ id: "000000018" });
    expect(res.status).toBe(402);
    expect(res.body.valid).toBeUndefined();
    expect(calls.verify).toHaveLength(1);
    // The facilitator was handed the SERVER's requirements, with our wallet, never the client's copy.
    expect((calls.verify[0][1] as { payTo: string }).payTo).toBe(PAY_TO);
    expect(calls.settle).toHaveLength(0);
  });

  it("serves the response only after settlement succeeds, and reports it in PAYMENT-RESPONSE", async () => {
    const calls: StubCalls = { verify: [], settle: [] };
    const app = createApp({
      config: {
        ...paidConfig,
        facilitatorClient: facilitatorStub({
          verify: async (...args) => { calls.verify.push(args); return { isValid: true, payer: PAY_TO }; },
          settle: async (...args) => { calls.settle.push(args); return { success: true, transaction: "0xabc", network: BASE, payer: PAY_TO }; },
        }, calls),
      },
    });
    const challenge = await request(app).post("/v1/validate/israeli-id").send({ id: "000000018" });
    const accepted = paymentRequired(challenge).accepts[0];

    const res = await request(app)
      .post("/v1/validate/israeli-id")
      .set("payment-signature", paymentFor(accepted))
      .send({ id: "000000018" });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(calls.verify).toHaveLength(1);
    expect(calls.settle).toHaveLength(1);
    const receipt = decodeHeader(res.headers["payment-response"]);
    expect(receipt?.success).toBe(true);
    expect(receipt?.transaction).toBe("0xabc");
  });

  it("withholds the response when settlement fails, and says so", async () => {
    const app = createApp({
      config: {
        ...paidConfig,
        facilitatorClient: facilitatorStub({
          verify: async () => ({ isValid: true, payer: PAY_TO }),
          settle: async () => ({ success: false, errorReason: "insufficient_funds", transaction: "", network: BASE }),
        }),
      },
    });
    const challenge = await request(app).post("/v1/validate/israeli-id").send({ id: "000000018" });
    const accepted = paymentRequired(challenge).accepts[0];

    const res = await request(app)
      .post("/v1/validate/israeli-id")
      .set("payment-signature", paymentFor(accepted))
      .send({ id: "000000018" });
    expect(res.status).toBe(402);
    expect(res.body.valid).toBeUndefined();
    expect(res.body.error).toBe("settlement_failed");
    expect(res.body.reason).toBe("insufficient_funds");
  });

  it("rejects a payment whose accepted requirements were tampered with, before verify", async () => {
    const calls: StubCalls = { verify: [], settle: [] };
    const app = createApp({ config: { ...paidConfig, facilitatorClient: facilitatorStub({}, calls) } });
    const challenge = await request(app).post("/v1/json/repair").send("{bad");
    const accepted = paymentRequired(challenge).accepts[0];

    for (const mutate of [
      (a: Record<string, unknown>) => { a.payTo = "0x2222222222222222222222222222222222222222"; },
      (a: Record<string, unknown>) => { a.amount = "1"; },
      (a: Record<string, unknown>) => { a.network = "eip155:84532"; },
    ]) {
      const res = await request(app)
        .post("/v1/json/repair")
        .set("payment-signature", paymentFor(accepted, mutate))
        .send("{bad");
      expect(res.status).toBe(402);
      expect(paymentRequired(res).error).toBe("No matching payment requirements");
    }
    expect(calls.verify).toHaveLength(0);
  });

  it("keeps discovery free while paid mode is on", async () => {
    const app = createApp({ config: paidConfig });
    for (const path of ["/health", "/pricing", "/.well-known/x402.json"]) {
      const free = await request(app).get(path);
      expect(free.status).toBe(200);
    }
    const pricing = await request(app).get("/pricing");
    expect(pricing.body.x402Version).toBe(2);
    expect(pricing.body.network).toBe(BASE);
    expect(pricing.body.payTo).toBe(PAY_TO);
    expect(pricing.body.endpoints.map((e: { price: string }) => e.price)).toEqual(["$0.002", "$0.002", "$0.002", "$0.002", "$0.002", "$0.004"]);
  });

  it("fails closed with a 5xx that is not the fallback's 503 when the facilitator cannot be reached", async () => {
    // This is the operational change v2 brings: the first paid request needs
    // the facilitator's supported-kinds list. If that call fails, the honest
    // answer is "payment infrastructure unavailable", not a free response.
    // The SDK answers 502 for a facilitator HTTP error and 500 for anything
    // else (a network failure is a plain Error); either way the endpoint stays
    // shut. 503 would mean the packages failed to load, a different failure.
    const app = createApp({
      config: {
        ...paidConfig,
        facilitatorClient: facilitatorStub({
          getSupported: async () => { throw new Error("EGRESS_BLOCKED"); },
        }),
      },
    });
    const res = await request(app).post("/v1/validate/phone").send({ phone: "0501234567" });
    expect([500, 502]).toContain(res.status);
    expect(res.body.valid).toBeUndefined();
    expect(res.body.error).not.toBe("payment_unavailable");

    const health = await request(app).get("/health");
    expect(health.status).toBe(200);
  });

  it("refuses to build for a wallet that fails its EIP-55 checksum", () => {
    // Mixed case with a wrong checksum: the classic one-character typo.
    const badChecksum = "0xAbcdef1234567890abcdef1234567890ABCDEF12";
    expect(() => buildPaywall({ ...paidConfig, payTo: badChecksum })).toThrow(PaywallConfigError);
  });

  it("refuses to build for an EVM network the exact scheme has no USDC asset for", () => {
    expect(() => buildPaywall({ ...paidConfig, network: "eip155:99999999" })).toThrow(PaywallConfigError);
  });
});

describe("the fail-closed fallback (packages missing)", () => {
  const missing: ModuleLoader = (id) => { throw new Error(`Cannot find module '${id}'`); };
  const paidConfig = loadConfig({ X402_PAY_TO: PAY_TO } as NodeJS.ProcessEnv);

  it("answers 503 on /v1 whatever the letter case, and keeps discovery up", async () => {
    const app = createApp({ config: paidConfig, paywall: (config) => buildPaywall(config, missing) });
    for (const path of ["/v1/validate/israeli-id", "/V1/validate/israeli-id", "/v1/json/repair", "/V1/JSON/REPAIR"]) {
      const res = await request(app).post(path).send({ id: "000000018" });
      expect(res.status, path).toBe(503);
      expect(res.body.error).toBe("payment_unavailable");
      expect(res.body.valid).toBeUndefined();
    }
    const res = await request(app).head("/V1/hebrew-date");
    expect(res.status).toBe(503);
    expect((await request(app).get("/health")).status).toBe(200);
  });

  it("falls closed if any ONE of the three packages is missing", async () => {
    for (const absent of ["@x402/express", "@x402/core/server", "@x402/evm/exact/server", "@x402/evm"]) {
      const loader: ModuleLoader = (id) => {
        if (id === absent) throw new Error(`Cannot find module '${id}'`);
        return createRequire(import.meta.url)(id);
      };
      const app = createApp({ config: paidConfig, paywall: (config) => buildPaywall(config, loader) });
      const res = await request(app).post("/v1/validate/phone").send({ phone: "0501234567" });
      expect(res.status, `with ${absent} missing`).toBe(503);
    }
  });
});

describe("probeFacilitator (what index.ts asks before listening)", () => {
  const base = loadConfig({ X402_PAY_TO: PAY_TO } as NodeJS.ProcessEnv);

  it("reports supported when the facilitator lists exact on our network", async () => {
    expect(await probeFacilitator({ ...base, facilitatorClient: facilitatorStub() })).toEqual({ status: "supported" });
  });

  it("reports unsupported, with what was offered, when it does not — the case that would exit the process", async () => {
    const probe = await probeFacilitator({
      ...base,
      facilitatorClient: facilitatorStub({
        getSupported: async () => ({ kinds: [{ x402Version: 2, scheme: "exact", network: "eip155:84532" }], extensions: [], signers: {} }),
      }),
    });
    expect(probe.status).toBe("unsupported");
    expect((probe as { kinds: unknown[] }).kinds).toHaveLength(1);
  });

  it("reports unreachable, not unsupported, on a network error", async () => {
    const probe = await probeFacilitator({
      ...base,
      facilitatorClient: facilitatorStub({ getSupported: async () => { throw new Error("ECONNREFUSED"); } }),
    });
    expect(probe).toEqual({ status: "unreachable", error: "ECONNREFUSED" });
  });
});

describe("config validation", () => {
  it("normaliseNetwork maps the two legacy names, lower-cases, and passes EVM CAIP-2 through", () => {
    expect(normaliseNetwork("base")).toBe("eip155:8453");
    expect(normaliseNetwork("Base-Sepolia")).toBe("eip155:84532");
    expect(normaliseNetwork(undefined)).toBe("eip155:8453");
    expect(normaliseNetwork("  ")).toBe("eip155:8453");
    expect(normaliseNetwork("eip155:8453")).toBe("eip155:8453");
    // The SDK matches the facilitator's kinds by exact string; upper case would never match.
    expect(normaliseNetwork("EIP155:8453")).toBe("eip155:8453");
  });

  it("normaliseNetwork refuses anything the exact EVM scheme cannot settle on", () => {
    for (const bad of ["bsae", "ethereum mainnet", "eip155:8453x", "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", "polygon-ish"]) {
      expect(() => normaliseNetwork(bad), bad).toThrow(/not an EVM CAIP-2/);
    }
    expect(() => loadConfig({ X402_PAY_TO: PAY_TO, X402_NETWORK: "polygon-ish" } as NodeJS.ProcessEnv)).toThrow();
  });

  it("parsePriceUsd defaults when unset and refuses a set-but-unusable value instead of silently replacing it", () => {
    expect(parsePriceUsd(undefined)).toBe(0.002);
    expect(parsePriceUsd("  ")).toBe(0.002);
    expect(parsePriceUsd("0.01")).toBe(0.01);
    expect(parsePriceUsd("0.000001")).toBe(0.000001);
    for (const bad of ["0", "-1", "abc", "1e-7", "0.0000005", "0.0000015", "0.1234567"]) {
      expect(() => parsePriceUsd(bad), bad).toThrow();
    }
  });

  it("formatUsd never emits exponent notation and matches what the middleware parses", () => {
    expect(formatUsd(0.002)).toBe("$0.002");
    expect(formatUsd(0.004)).toBe("$0.004");
    expect(formatUsd(0.000001)).toBe("$0.000001");
    expect(formatUsd(1)).toBe("$1");
    expect(formatUsd(12.5)).toBe("$12.5");
  });

  it("validatePayTo accepts a shape-valid address and refuses a short one, a non-hex one, and the zero address", () => {
    expect(validatePayTo(undefined)).toBeNull();
    expect(validatePayTo(" ")).toBeNull();
    expect(validatePayTo(PAY_TO)).toBe(PAY_TO);
    expect(() => validatePayTo("0x111111111111111111111111111111111111111")).toThrow(/not an EVM address/);
    expect(() => validatePayTo("not-an-address")).toThrow(/not an EVM address/);
    expect(() => validatePayTo("0x0000000000000000000000000000000000000000")).toThrow(/zero address/);
  });
});
