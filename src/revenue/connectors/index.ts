import { gumroadConnector } from "./gumroad.js";
import { lemonSqueezyConnector } from "./lemonsqueezy.js";
import { stripeConnector } from "./stripe.js";
import type { RevenueConnector } from "./types.js";

export { readLocalTransfers } from "./x402-local.js";
export { UNASSIGNED_LINE_ID, extractLineTag } from "./types.js";
export type { RevenueConnector, ConnectorFetchResult } from "./types.js";

export const REMOTE_CONNECTORS: RevenueConnector[] = [
  stripeConnector,
  lemonSqueezyConnector,
  gumroadConnector,
];
