import { Store } from "./store.js";
import { createBot, DEFAULT_CONFIG } from "./bot.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is required (create the bot with @BotFather and paste its token).");
  process.exit(1);
}

const num = (key: string, fallback: number): number => {
  const v = Number(process.env[key]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

const store = new Store(process.env.STATE_FILE ?? "./state.json", process.env.PAYMENTS_LOG ?? "./payments.jsonl");
const bot = createBot({
  token,
  store,
  freeDaily: num("FREE_DAILY", DEFAULT_CONFIG.freeDaily),
  proStars: num("PRO_STARS", DEFAULT_CONFIG.proStars),
  proDays: num("PRO_DAYS", DEFAULT_CONFIG.proDays),
  creditsStars: num("CREDITS_STARS", DEFAULT_CONFIG.creditsStars),
  creditsCount: num("CREDITS_COUNT", DEFAULT_CONFIG.creditsCount),
});

bot.catch((err) => console.error("bot error", err.error));
console.log("il-tools bot starting (long polling)");
bot.start();
