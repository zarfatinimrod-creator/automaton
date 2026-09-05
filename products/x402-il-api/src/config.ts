/**
 * Runtime configuration. Everything comes from the environment so the same
 * image runs free (dev) or paywalled (production) without a code change.
 */
export interface PriceEntry {
  path: string;
  method: string;
  priceUsd: number;
  description: string;
}

/**
 * The subset of @x402/core's FacilitatorClient this API needs. Declared here so
 * tests can inject a stub without importing the (optional) x402 packages, and so
 * the seam is visible: the facilitator is the one network dependency of paid mode.
 */
export interface FacilitatorLike {
  getSupported(): Promise<unknown>;
  verify(paymentPayload: unknown, paymentRequirements: unknown): Promise<unknown>;
  settle(paymentPayload: unknown, paymentRequirements: unknown): Promise<unknown>;
}

export interface Config {
  port: number;
  payTo: string | null;
  /** CAIP-2 network id, e.g. `eip155:8453` (Base mainnet). See normaliseNetwork. */
  network: string;
  facilitatorUrl: string | null;
  /** Injected facilitator (tests). Null means build the real HTTP client. */
  facilitatorClient: FacilitatorLike | null;
  defaultPriceUsd: number;
  paywallEnabled: boolean;
}

/**
 * x402 v2 identifies networks by CAIP-2 (`eip155:<chainId>`), where v1 used bare
 * names. The two names this product has ever been deployed with are mapped so
 * an existing `X402_NETWORK=base` keeps working; anything else must already be
 * CAIP-2. An unrecognised value throws at load rather than being passed through,
 * because a wrong network id here is a wrong settlement chain for real money.
 */
const LEGACY_NETWORK_NAMES: Record<string, string> = {
  base: "eip155:8453",
  "base-sepolia": "eip155:84532",
};

export function normaliseNetwork(raw: string | undefined): string {
  const value = (raw ?? "").trim() || "base";
  const mapped = LEGACY_NETWORK_NAMES[value];
  if (mapped) return mapped;
  if (/^[a-z0-9-]+:[A-Za-z0-9-]+$/i.test(value)) return value;
  throw new Error(
    `X402_NETWORK="${value}" is not a CAIP-2 network id (e.g. eip155:8453) and not one of the ` +
    `legacy names ${Object.keys(LEGACY_NETWORK_NAMES).join(", ")}. Refusing to guess a settlement chain.`,
  );
}

const num = (raw: string | undefined, fallback: number): number => {
  const v = Number(raw);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const payTo = env.X402_PAY_TO?.trim() || null;
  return {
    port: num(env.PORT, 8402),
    payTo,
    network: normaliseNetwork(env.X402_NETWORK),
    facilitatorUrl: env.X402_FACILITATOR_URL?.trim() || null,
    facilitatorClient: null,
    // The Coinbase CDP facilitator charges $0.001 per settlement beyond 1,000
    // free per month, so the floor price must stay meaningfully above that.
    defaultPriceUsd: num(env.X402_PRICE_USD, 0.002),
    paywallEnabled: Boolean(payTo),
  };
}

/** Every billable endpoint. /health and /pricing stay free so agents can discover us. */
export function priceList(config: Config): PriceEntry[] {
  const p = config.defaultPriceUsd;
  return [
    { path: "/v1/validate/israeli-id", method: "POST", priceUsd: p, description: "Israeli ID (teudat zehut) checksum validation" },
    { path: "/v1/validate/phone", method: "POST", priceUsd: p, description: "Israeli phone validation and E.164 normalisation" },
    { path: "/v1/validate/bank", method: "POST", priceUsd: p, description: "Israeli bank/branch/account format check (format only)" },
    { path: "/v1/hebrew-date", method: "GET", priceUsd: p, description: "Gregorian to Hebrew date conversion" },
    { path: "/v1/transliterate", method: "POST", priceUsd: p, description: "Hebrew to Latin transliteration (approximate)" },
    { path: "/v1/json/repair", method: "POST", priceUsd: p * 2, description: "Repair malformed JSON produced by LLMs" },
  ];
}
