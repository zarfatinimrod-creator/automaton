/**
 * The Express app. Kept separate from the server bootstrap so tests can mount
 * it with any config (free mode, paywalled mode) without opening a port.
 */
import { createRequire } from "node:module";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { jsonrepair } from "jsonrepair";
import { formatUsd, loadConfig, priceList, type Config, type FacilitatorLike } from "./config.js";
import {
  toHebrewDate, transliterate, validateIsraeliBank, validateIsraeliId, validateIsraeliPhone,
} from "./israeli.js";
// Type-only imports: they cost nothing at runtime and let tsc check this file
// against the real @x402 signatures, so a future bump that changes them fails
// the typecheck instead of the first paid request.
import type { paymentMiddleware as PaymentMiddleware, x402ResourceServer as X402ResourceServer } from "@x402/express";
import type { FacilitatorClient, HTTPFacilitatorClient as HttpFacilitatorClient, RouteConfig } from "@x402/core/server";
import type { Network } from "@x402/core/types";
import type { registerExactEvmScheme as RegisterExactEvmScheme } from "@x402/evm/exact/server";

export type PaywallFactory = (config: Config) => express.RequestHandler | null;

/** How the optional @x402 packages are loaded. Tests inject a failing loader to reach the fail-closed path. */
export type ModuleLoader = (id: string) => unknown;

// The @x402/* packages are dual-published (CJS + ESM). This module is ESM, so
// bare `require` is not defined here; createRequire loads the CJS builds
// without making the factory async (createApp calls it synchronously).
const cjsLoader: ModuleLoader = createRequire(import.meta.url);

interface X402Modules {
  paymentMiddleware: typeof PaymentMiddleware;
  x402ResourceServer: typeof X402ResourceServer;
  HTTPFacilitatorClient: typeof HttpFacilitatorClient;
  registerExactEvmScheme: typeof RegisterExactEvmScheme;
  /** Throws when the network has no default USDC asset table entry. */
  getDefaultAsset: (network: string) => unknown;
  /** viem's isAddress, if viem is resolvable (it arrives transitively through @x402/evm). */
  isAddress: ((address: string, options?: { strict?: boolean }) => boolean) | null;
}

function loadX402(load: ModuleLoader): X402Modules {
  const { paymentMiddleware, x402ResourceServer } = load("@x402/express") as Pick<X402Modules, "paymentMiddleware" | "x402ResourceServer">;
  // Import from @x402/core/server ONLY. The @x402/core root entry bundles its
  // own copies of the same classes, and instanceof across the two is false —
  // @x402/express's error handling depends on the /server identities.
  const { HTTPFacilitatorClient } = load("@x402/core/server") as Pick<X402Modules, "HTTPFacilitatorClient">;
  const { registerExactEvmScheme } = load("@x402/evm/exact/server") as Pick<X402Modules, "registerExactEvmScheme">;
  const { getDefaultAsset } = load("@x402/evm") as Pick<X402Modules, "getDefaultAsset">;
  let isAddress: X402Modules["isAddress"] = null;
  try {
    isAddress = (load("viem") as { isAddress: NonNullable<X402Modules["isAddress"]> }).isAddress;
  } catch {
    // viem is not a direct dependency; without it the EIP-55 check is skipped and validatePayTo's shape check stands alone.
  }
  return { paymentMiddleware, x402ResourceServer, HTTPFacilitatorClient, registerExactEvmScheme, getDefaultAsset, isAddress };
}

/**
 * A configuration the paywall cannot honour. Thrown, never swallowed: a paid
 * deploy with a mis-checksummed wallet or a network the scheme cannot settle
 * on must refuse to start rather than run with /v1 shut and /health green.
 */
export class PaywallConfigError extends Error {
  override readonly name = "PaywallConfigError";
}

/** The facilitator this deploy talks to: the injected one (tests) or the real HTTP client. */
export function createFacilitatorClient(config: Config, mods: Pick<X402Modules, "HTTPFacilitatorClient">): FacilitatorLike {
  if (config.facilitatorClient) return config.facilitatorClient;
  const headers = config.facilitatorAuthToken ? { Authorization: `Bearer ${config.facilitatorAuthToken}` } : null;
  return new mods.HTTPFacilitatorClient({
    ...(config.facilitatorUrl ? { url: config.facilitatorUrl } : {}),
    // The SDK wants the headers keyed by facilitator path, not a flat object.
    ...(headers ? { createAuthHeaders: async () => ({ verify: headers, settle: headers, supported: headers }) } : {}),
  }) as unknown as FacilitatorLike;
}

export type FacilitatorProbe =
  | { status: "supported" }
  | { status: "unsupported"; kinds: unknown[] }
  | { status: "unreachable"; error: string };

/**
 * Ask the facilitator, before listening, whether it will settle `exact` on our
 * network. v2 refuses to build a 402 until it has this answer, and the SDK's
 * own background check calls process.exit(1) when the answer is no — so the
 * bootstrap asks first, in its own words, and decides deliberately.
 */
export async function probeFacilitator(config: Config, load: ModuleLoader = cjsLoader): Promise<FacilitatorProbe> {
  const client = createFacilitatorClient(config, loadX402(load));
  let supported: { kinds?: Array<{ x402Version?: number; scheme?: string; network?: string }> } | undefined;
  try {
    supported = (await client.getSupported()) as typeof supported;
  } catch (error) {
    return { status: "unreachable", error: (error as Error).message };
  }
  const kinds = supported?.kinds ?? [];
  const ok = kinds.some((k) => k.x402Version === 2 && k.scheme === "exact" && k.network === config.network);
  return ok ? { status: "supported" } : { status: "unsupported", kinds };
}

/**
 * Fail closed. Matches the way Express matches — case-insensitively — so that
 * `/V1/...` cannot slip past a guard written for `/v1/...`.
 */
const failClosed: express.RequestHandler = (req, res, next) => {
  if (/^\/v1\//i.test(req.path)) {
    res.status(503).json({ error: "payment_unavailable", message: "x402 middleware unavailable" });
    return;
  }
  next();
};

/**
 * Build the x402 paywall middleware. The packages are optionalDependencies on
 * purpose: the API must boot in free mode even where they are absent, and paid
 * mode fails closed here if they are. Configuration errors, by contrast, throw.
 */
export function buildPaywall(config: Config, load: ModuleLoader = cjsLoader): express.RequestHandler | null {
  if (!config.paywallEnabled) return null;

  let mods: X402Modules;
  try {
    mods = loadX402(load);
  } catch (error) {
    console.error(
      `x402 paywall requested but the @x402 packages could not be loaded (${(error as Error).message}). ` +
      "Refusing to serve paid endpoints for free — install @x402/express, @x402/core and @x402/evm, or unset X402_PAY_TO.",
    );
    return failClosed;
  }

  const payTo = config.payTo!;
  if (mods.isAddress && !mods.isAddress(payTo, { strict: true })) {
    throw new PaywallConfigError(
      `X402_PAY_TO="${payTo}" fails its EIP-55 checksum. A mixed-case address that does not checksum is a typo, ` +
      "and every payment would be directed to it. Use the all-lowercase form if you are sure.",
    );
  }
  try {
    mods.getDefaultAsset(config.network);
  } catch (error) {
    throw new PaywallConfigError(`No default USDC asset is known for ${config.network}; the exact scheme cannot price on it (${(error as Error).message}).`);
  }

  // v2 asks the facilitator which (scheme, network) pairs it supports before it
  // will build a single 402 — so paid mode has one network dependency, and it is
  // this client. Tests inject a stub through config; production talks to the
  // default facilitator unless X402_FACILITATOR_URL says otherwise.
  const facilitator = createFacilitatorClient(config, mods);
  const network = config.network as Network;
  const server = mods.registerExactEvmScheme(
    new mods.x402ResourceServer(facilitator as unknown as FacilitatorClient),
    { networks: [network] },
  );

  // v2 puts the payment requirements in the PAYMENT-REQUIRED response header
  // (base64 JSON) and, by default, sends an empty JSON body. An agent that
  // only reads bodies would see a bare 402 and nothing else, so say where to
  // look. This is the API's own text, not the protocol's.
  const unpaidResponseBody: RouteConfig["unpaidResponseBody"] = () => ({
    contentType: "application/json",
    body: {
      error: "payment_required",
      message: "This endpoint is paid over x402 v2. The payment requirements are in the PAYMENT-REQUIRED response header (base64 JSON); send the payment in a PAYMENT-SIGNATURE header. The full price list is at GET /pricing.",
      pricing: "/pricing",
    },
  });
  // Same courtesy when a payment verified but settlement failed: the SDK
  // withholds the handler's output (correct) and would otherwise answer {}.
  const settlementFailedResponseBody: RouteConfig["settlementFailedResponseBody"] = (_context, failure) => ({
    contentType: "application/json",
    body: {
      error: "settlement_failed",
      reason: failure.errorReason || "unknown",
      pricing: "/pricing",
    },
  });

  const routes: Record<string, RouteConfig> = {};
  for (const entry of priceList(config)) {
    const route: RouteConfig = {
      accepts: { scheme: "exact", price: formatUsd(entry.priceUsd), network, payTo },
      description: entry.description,
      ...(config.publicBaseUrl ? { resource: `${config.publicBaseUrl}${entry.path}` } : {}),
      unpaidResponseBody,
      settlementFailedResponseBody,
    };
    routes[`${entry.method} ${entry.path}`] = route;
    // Express answers HEAD with the GET handler; the paywall must see it too.
    if (entry.method === "GET") routes[`HEAD ${entry.path}`] = route;
  }

  const middleware = mods.paymentMiddleware(routes, server);
  // The v2 middleware is async. Express 4 ignores a returned promise, so an
  // escape from inside it would leave the request hanging; route it to the
  // error handler instead.
  return (req, res, next) => {
    void middleware(req, res, next).catch(next);
  };
}

export const defaultPaywall: PaywallFactory = (config) => buildPaywall(config);

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
    x402Version: 2,
    payTo: config.paywallEnabled ? config.payTo : null,
    network: config.network,
    currency: "USDC",
    endpoints: priceList(config).map((e) => ({
      method: e.method, path: e.path, price: formatUsd(e.priceUsd), description: e.description,
    })),
    note: config.paywallEnabled
      ? "Send an x402 v2 payment in a PAYMENT-SIGNATURE header. A bare request returns 402 with the requirements in the PAYMENT-REQUIRED response header (base64 JSON)."
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
