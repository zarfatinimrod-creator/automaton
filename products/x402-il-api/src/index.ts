import { createApp, probeFacilitator } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();

if (!config.paywallEnabled) {
  console.warn("X402_PAY_TO is not set — running in FREE mode. Set it to a wallet address to charge per request.");
} else {
  // v2 cannot build a 402 until the facilitator has said it settles `exact` on
  // our network. Ask before listening so a misconfigured paid deploy refuses to
  // start with a sentence, instead of the SDK's background check exiting the
  // process a few hundred milliseconds after "listening".
  const probe = await probeFacilitator(config);
  if (probe.status === "unsupported") {
    console.error(
      `The facilitator${config.facilitatorUrl ? ` at ${config.facilitatorUrl}` : ""} does not list exact/${config.network} for x402 v2. ` +
      `Paid mode cannot work on it. Set X402_FACILITATOR_URL to one that does, or change X402_NETWORK. It offered: ${JSON.stringify(probe.kinds)}`,
    );
    process.exit(1);
  }
  if (probe.status === "unreachable") {
    console.warn(
      `The facilitator could not be reached at startup (${probe.error}). Discovery endpoints will serve; ` +
      "every paid request will answer 5xx until it is reachable, and none will be served free.",
    );
  }
}

const app = createApp({ config });

app.listen(config.port, () => {
  console.log(`x402-il-api listening on :${config.port} (${config.paywallEnabled ? `paid, ${config.network}` : "free"})`);
});
