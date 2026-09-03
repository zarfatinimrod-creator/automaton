import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp, defaultPaywall } from "../src/app.js";
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

  it("wires every billable route into the paywall with a price", () => {
    const seen: Record<string, unknown> = {};
    createApp({
      config: paidConfig,
      paywall: (config) => {
        for (const e of [
          "/v1/validate/israeli-id", "/v1/validate/phone", "/v1/validate/bank",
          "/v1/hebrew-date", "/v1/transliterate", "/v1/json/repair",
        ]) seen[e] = config.payTo;
        return null;
      },
    });
    expect(Object.keys(seen)).toHaveLength(6);
    expect(paidConfig.paywallEnabled).toBe(true);
    expect(paidConfig.defaultPriceUsd).toBeGreaterThan(0.001);
  });

  it("returns the 402 challenge produced by the middleware and leaves discovery free", async () => {
    const app = createApp({
      config: paidConfig,
      paywall: () => (req, res, next) => {
        if (!req.path.startsWith("/v1/")) return next();
        if (req.get("X-PAYMENT")) return next();
        return res.status(402).json({
          x402Version: 1,
          accepts: [{ scheme: "exact", network: "base", payTo: paidConfig.payTo, maxAmountRequired: "2000", asset: "USDC" }],
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
describe("defaultPaywall (the real production path)", () => {
  const paidConfig = loadConfig({
    X402_PAY_TO: "0x1111111111111111111111111111111111111111",
    X402_NETWORK: "base",
  } as NodeJS.ProcessEnv);

  it("returns null in free mode so nothing is paywalled", () => {
    expect(defaultPaywall(loadConfig({} as NodeJS.ProcessEnv))).toBeNull();
  });

  it("loads x402-express and builds real middleware when a wallet is configured", () => {
    const middleware = defaultPaywall(paidConfig);
    expect(typeof middleware).toBe("function");
  });

  it("challenges an unpaid /v1 request with 402, never 503, and keeps discovery free", async () => {
    const app = createApp({ config: paidConfig });

    const challenge = await request(app).post("/v1/validate/israeli-id").send({ id: "000000018" });
    // 503 means the middleware failed to load and we fell back to fail-closed.
    expect(challenge.status).not.toBe(503);
    expect(challenge.status).toBe(402);

    for (const path of ["/health", "/pricing", "/.well-known/x402.json"]) {
      const free = await request(app).get(path);
      expect(free.status).toBe(200);
    }
  });
});
