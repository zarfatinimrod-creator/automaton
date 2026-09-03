/**
 * The Express app. Kept separate from the server bootstrap so tests can mount
 * it with any config (free mode, paywalled mode) without opening a port.
 */
import { createRequire } from "node:module";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { jsonrepair } from "jsonrepair";
import { loadConfig, priceList, type Config } from "./config.js";
import {
  toHebrewDate, transliterate, validateIsraeliBank, validateIsraeliId, validateIsraeliPhone,
} from "./israeli.js";

export type PaywallFactory = (config: Config) => express.RequestHandler | null;

/**
 * Build the x402 paywall middleware. Loaded lazily and optionally: the API must
 * boot (in free mode) even where the x402 package is unavailable.
 */
export const defaultPaywall: PaywallFactory = (config) => {
  if (!config.paywallEnabled) return null;
  try {
    // x402-express is dual-published (CJS + ESM). This module is ESM, so bare
    // `require` is not defined here; createRequire loads the CJS build without
    // making this factory async (createApp calls it synchronously).
    const requireCjs = createRequire(import.meta.url);
    const { paymentMiddleware } = requireCjs("x402-express") as {
      paymentMiddleware: (payTo: string, routes: Record<string, unknown>, facilitator?: unknown) => express.RequestHandler;
    };
    const routes: Record<string, unknown> = {};
    for (const entry of priceList(config)) {
      routes[`${entry.method} ${entry.path}`] = {
        price: `$${entry.priceUsd}`,
        network: config.network,
        config: { description: entry.description },
      };
    }
    return paymentMiddleware(
      config.payTo!,
      routes,
      config.facilitatorUrl ? { url: config.facilitatorUrl } : undefined,
    );
  } catch (error) {
    console.error(
      `x402 paywall requested but x402-express could not be loaded (${(error as Error).message}). ` +
      "Refusing to serve paid endpoints for free — install x402-express or unset X402_PAY_TO.",
    );
    // Fail closed: block the billable routes rather than give them away.
    return (req, res, next) => {
      if (req.path.startsWith("/v1/")) {
        res.status(503).json({ error: "payment_unavailable", message: "x402 middleware unavailable" });
        return;
      }
      next();
    };
  }
};

const asRecord = (body: unknown): Record<string, unknown> =>
  body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};

export function createApp(options: { config?: Config; paywall?: PaywallFactory } = {}): Express {
  const config = options.config ?? loadConfig();
  const paywallFactory = options.paywall ?? defaultPaywall;
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "256kb" }));
  app.use(express.text({ limit: "256kb", type: ["text/plain", "application/x-ndjson"] }));

  // ── Free discovery endpoints (never behind the paywall) ──
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", paywall: config.paywallEnabled ? "x402" : "free", network: config.network });
  });

  const pricingBody = () => ({
    x402Version: 1,
    payTo: config.paywallEnabled ? config.payTo : null,
    network: config.network,
    currency: "USDC",
    endpoints: priceList(config).map((e) => ({
      method: e.method, path: e.path, price: `$${e.priceUsd}`, description: e.description,
    })),
    note: config.paywallEnabled
      ? "Send an x402 payment header; a bare request returns 402 with the payment requirements."
      : "Running in free mode (X402_PAY_TO is unset). No payment is required.",
  });
  app.get("/pricing", (_req, res) => res.json(pricingBody()));
  app.get("/.well-known/x402.json", (_req, res) => res.json(pricingBody()));

  // ── Paywall (only wraps /v1) ──
  const paywall = paywallFactory(config);
  if (paywall) app.use(paywall);

  // ── Billable endpoints ──
  app.post("/v1/validate/israeli-id", (req, res) => {
    const body = asRecord(req.body);
    if (body.id === undefined) return res.status(400).json({ error: "bad_request", message: "field 'id' is required" });
    return res.json(validateIsraeliId(body.id));
  });

  app.post("/v1/validate/phone", (req, res) => {
    const body = asRecord(req.body);
    if (body.phone === undefined) return res.status(400).json({ error: "bad_request", message: "field 'phone' is required" });
    return res.json(validateIsraeliPhone(body.phone));
  });

  app.post("/v1/validate/bank", (req, res) => {
    const body = asRecord(req.body);
    return res.json(validateIsraeliBank(body));
  });

  app.get("/v1/hebrew-date", (req, res) => {
    const date = typeof req.query.date === "string" && req.query.date.trim()
      ? req.query.date.trim()
      : new Date().toISOString().slice(0, 10);
    try {
      return res.json(toHebrewDate(date));
    } catch (error) {
      return res.status(400).json({ error: "bad_request", message: (error as Error).message });
    }
  });

  app.post("/v1/transliterate", (req, res) => {
    const body = asRecord(req.body);
    const text = typeof body.text === "string" ? body.text : typeof req.body === "string" ? req.body : "";
    if (!text) return res.status(400).json({ error: "bad_request", message: "field 'text' is required" });
    return res.json({ input: text, latin: transliterate(text), note: "Rule-based and approximate; not a standard romanisation." });
  });

  app.post("/v1/json/repair", (req, res) => {
    const raw = typeof req.body === "string"
      ? req.body
      : typeof asRecord(req.body).json === "string"
        ? (asRecord(req.body).json as string)
        : "";
    if (!raw) return res.status(400).json({ error: "bad_request", message: "send raw text or a 'json' field" });
    try {
      const repaired = jsonrepair(raw);
      return res.json({ repaired, parsed: JSON.parse(repaired), changed: repaired !== raw });
    } catch (error) {
      return res.status(422).json({ error: "unrepairable", message: (error as Error).message });
    }
  });

  app.use((_req, res) => res.status(404).json({ error: "not_found", message: "See GET /pricing for the endpoint list." }));

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("unhandled error", error);
    res.status(500).json({ error: "internal_error" });
  });

  return app;
}
