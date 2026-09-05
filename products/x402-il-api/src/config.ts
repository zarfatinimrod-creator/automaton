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
  /** EVM address that receives USDC, or null for free mode. See validatePayTo. */
  payTo: string | null;
  /** CAIP-2 network id, e.g. `eip155:8453` (Base mainnet). See normaliseNetwork. */
  network: string;
  facilitatorUrl: string | null;
  /** Bearer token sent to the facilitator on verify/settle/supported, if it requires one. */
  facilitatorAuthToken: string | null;
  /** Injected facilitator (tests). Null means build the real HTTP client. */
  facilitatorClient: FacilitatorLike | null;
  /** Public origin, e.g. https://api.example.com, used for the resource URL advertised in a 402. */
  publicBaseUrl: string | null;
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

/**
 * Only `eip155:<chainId>` is accepted, because this API registers only the EVM
 * `exact` scheme: any other CAIP-2 id would load, advertise itself on /health,
 * and then fail every paid request. Lower-cased first, because the SDK matches
 * the facilitator's kinds by exact string and `EIP155:8453` would never match.
 */
const EVM_CAIP2 = /^eip155:\d+$/;

export function normaliseNetwork(raw: string | undefined): string {
  const value = (raw ?? "").trim().toLowerCase() || "base";
  const mapped = LEGACY_NETWORK_NAMES[value];
  if (mapped) return mapped;
  if (EVM_CAIP2.test(value)) return value;
  throw new Error(
    `X402_NETWORK="${raw}" is not an EVM CAIP-2 network id (eip155:<chainId>, e.g. eip155:8453) and not one of the ` +
    `legacy names ${Object.keys(LEGACY_NETWORK_NAMES).join(", ")}. This API only registers the EVM exact scheme, ` +
    "so nothing else can settle. Refusing to guess a settlement chain.",
  );
}

/** One atomic unit of USDC (6 decimals). Below this a price cannot be represented at all. */
export const MIN_PRICE_USD = 0.000001;
export const DEFAULT_PRICE_USD = 0.002;

/**
 * A set-but-invalid price is a configuration error, not a reason to fall back
 * to the default silently: the operator asked for a number and would otherwise
 * be charging something else. Prices with more than six decimals are refused
 * rather than truncated, because the truncated amount would be less than what
 * /pricing advertises.
 */
export function parsePriceUsd(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === "") return DEFAULT_PRICE_USD;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`X402_PRICE_USD="${raw}" is not a positive number.`);
  }
  if (value < MIN_PRICE_USD) {
    throw new Error(`X402_PRICE_USD="${raw}" is below ${MIN_PRICE_USD}, one atomic unit of USDC; it cannot be charged.`);
  }
  const rounded = Math.round(value * 1e6) / 1e6;
  if (Math.abs(rounded - value) > 1e-12) {
    throw new Error(`X402_PRICE_USD="${raw}" has more than six decimal places; USDC cannot represent it and the charge would be less than advertised.`);
  }
  return rounded;
}

/**
 * The one price formatter, used both for /pricing and for the string the x402
 * middleware parses, so the two can never disagree. Never exponent notation:
 * JavaScript renders 0.0000005 as "5e-7", which the SDK rejects as money.
 */
export function formatUsd(usd: number): string {
  return `$${usd.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}`;
}

/**
 * Shape check only: 0x plus forty hex digits, and not the zero address. A
 * mixed-case address's EIP-55 checksum is verified later by the paywall
 * factory, which has viem available; this file stays free of the optional
 * packages. A wrong-but-well-formed address cannot be caught by anyone but the
 * owner, and the README says so.
 */
export function validatePayTo(raw: string | undefined): string | null {
  const value = raw?.trim() || null;
  if (!value) return null;
  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
    throw new Error(`X402_PAY_TO="${value}" is not an EVM address (0x followed by 40 hex characters).`);
  }
  if (/^0x0{40}$/.test(value)) {
    throw new Error("X402_PAY_TO is the zero address; anything sent there is burned.");
  }
  return value;
}

const num = (raw: string | undefined, fallback: number): number => {
  const v = Number(raw);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const payTo = validatePayTo(env.X402_PAY_TO);
  return {
    port: num(env.PORT, 8402),
    payTo,
    network: normaliseNetwork(env.X402_NETWORK),
    facilitatorUrl: env.X402_FACILITATOR_URL?.trim() || null,
    facilitatorAuthToken: env.X402_FACILITATOR_AUTH?.trim() || null,
    facilitatorClient: null,
    publicBaseUrl: env.X402_PUBLIC_URL?.trim().replace(/\/+$/, "") || null,
    // The Coinbase CDP facilitator charges $0.001 per settlement beyond 1,000
    // free per month, so the default stays meaningfully above that.
    defaultPriceUsd: parsePriceUsd(env.X402_PRICE_USD),
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
