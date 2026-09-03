import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = createApp({ config });

if (!config.paywallEnabled) {
  console.warn("X402_PAY_TO is not set — running in FREE mode. Set it to a wallet address to charge per request.");
}

app.listen(config.port, () => {
  console.log(`x402-il-api listening on :${config.port} (${config.paywallEnabled ? `paid, ${config.network}` : "free"})`);
});
