/**
 * Telegram bot: Israeli ID / phone validation and Hebrew dates, paid with
 * Telegram Stars (currency XTR). Free daily quota, then a pro pass or
 * pay-per-use credits.
 */
import { Bot, type Context } from "grammy";
import { Store } from "./store.js";
import { fromHebrewDate, toHebrewDate, validateIsraeliId, validateIsraeliPhone } from "./utils.js";

export interface BotConfig {
  token: string;
  freeDaily: number;
  proStars: number;
  proDays: number;
  creditsStars: number;
  creditsCount: number;
  store: Store;
  botInfo?: ConstructorParameters<typeof Bot>[1] extends { botInfo?: infer B } ? B : never;
}

export const DEFAULT_CONFIG = {
  freeDaily: 3,
  proStars: 50,
  proDays: 30,
  creditsStars: 10,
  creditsCount: 20,
};

const PAYLOAD_PRO = "pro-30d";
const PAYLOAD_CREDITS = "credits-20";

const HELP = [
  "🇮🇱 כלים ישראליים בטלגרם",
  "",
  "/id 123456789 - בדיקת תקינות תעודת זהות (ספרת ביקורת)",
  "/phone 0501234567 - בדיקת מספר טלפון ישראלי ופורמט בינלאומי",
  "/hebdate 2026-09-03 - המרת תאריך לועזי לעברי (בלי תאריך = היום)",
  "/gregdate 21 אלול 5786 - המרת תאריך עברי ללועזי",
  "/pro - מנוי חודשי ללא הגבלה בכוכבי טלגרם",
  "/credits - חבילת שימושים בודדים",
  "/status - כמה שימושים נשארו לך היום",
  "",
  "3 שימושים חינם ביום. הבוט בודק פורמט וספרת ביקורת בלבד ואינו מאמת זהות מול שום מאגר.",
].join("\n");

export function createBot(config: BotConfig): Bot {
  const bot = new Bot(config.token, config.botInfo ? { botInfo: config.botInfo } : undefined);
  const { store } = config;

  const gate = async (ctx: Context): Promise<boolean> => {
    const userId = ctx.from?.id;
    if (!userId) return false;
    const result = store.consume(userId, config.freeDaily);
    if (result.allowed) return true;
    await ctx.reply(
      `נגמרו ${config.freeDaily} השימושים החינמיים להיום.\n/pro - מנוי חודשי ב-${config.proStars} ⭐\n/credits - ${config.creditsCount} שימושים ב-${config.creditsStars} ⭐`,
    );
    return false;
  };

  bot.command("start", (ctx) => ctx.reply(HELP));
  bot.command("help", (ctx) => ctx.reply(HELP));

  bot.command("status", (ctx) => {
    const userId = ctx.from?.id ?? 0;
    const u = store.get(userId);
    const pro = store.isPro(userId);
    return ctx.reply(
      pro
        ? `מנוי פרו פעיל עד ${new Date(u.proUntil!).toISOString().slice(0, 10)} ✅`
        : `שימושים חינם שנותרו היום: ${Math.max(0, config.freeDaily - u.usedToday)} | קרדיטים: ${u.credits}`,
    );
  });

  bot.command("id", async (ctx) => {
    const arg = (ctx.match ?? "").toString().trim();
    if (!arg) return ctx.reply("שלח: /id <מספר תעודת זהות>");
    if (!(await gate(ctx))) return;
    const r = validateIsraeliId(arg);
    return ctx.reply(r.valid ? `✅ ${r.normalized} - ספרת הביקורת תקינה` : `❌ ${arg} - לא תקין (${r.reason})`);
  });

  bot.command("phone", async (ctx) => {
    const arg = (ctx.match ?? "").toString().trim();
    if (!arg) return ctx.reply("שלח: /phone <מספר טלפון>");
    if (!(await gate(ctx))) return;
    const r = validateIsraeliPhone(arg);
    return ctx.reply(
      r.valid
        ? `✅ ${r.national} (${r.type})\nבינלאומי: ${r.e164}`
        : `❌ ${arg} - לא זוהה כמספר ישראלי (${r.reason})`,
    );
  });

  bot.command("hebdate", async (ctx) => {
    const arg = (ctx.match ?? "").toString().trim() || new Date().toISOString().slice(0, 10);
    if (!(await gate(ctx))) return;
    try {
      const r = toHebrewDate(arg);
      return ctx.reply(`📅 ${r.gregorian} → ${r.hebrew}\n(${r.hebrewLatin}; ${r.isLeapYear ? "שנה מעוברת" : "שנה פשוטה"})`);
    } catch (error) {
      return ctx.reply(`❌ ${(error as Error).message}. פורמט: /hebdate 2026-09-03`);
    }
  });

  bot.command("gregdate", async (ctx) => {
    const parts = (ctx.match ?? "").toString().trim().split(/\s+/);
    if (parts.length !== 3) return ctx.reply("שלח: /gregdate <יום> <חודש> <שנה עברית>, למשל /gregdate 21 אלול 5786");
    if (!(await gate(ctx))) return;
    try {
      const iso = fromHebrewDate(Number(parts[0]), parts[1], Number(parts[2]));
      return ctx.reply(`📅 ${parts[0]} ${parts[1]} ${parts[2]} → ${iso}`);
    } catch (error) {
      return ctx.reply(`❌ ${(error as Error).message}`);
    }
  });

  // ── Payments in Telegram Stars (XTR). provider_token must be empty for Stars. ──
  bot.command("pro", (ctx) =>
    ctx.replyWithInvoice(
      "מנוי פרו - 30 יום",
      "שימוש ללא הגבלה בכל הכלים למשך 30 יום",
      PAYLOAD_PRO,
      "XTR",
      [{ label: "מנוי פרו 30 יום", amount: config.proStars }],
      { provider_token: "" } as any,
    ),
  );

  bot.command("credits", (ctx) =>
    ctx.replyWithInvoice(
      `${config.creditsCount} שימושים`,
      "חבילת שימושים בודדים, ללא תפוגה",
      PAYLOAD_CREDITS,
      "XTR",
      [{ label: `${config.creditsCount} שימושים`, amount: config.creditsStars }],
      { provider_token: "" } as any,
    ),
  );

  bot.on("pre_checkout_query", (ctx) => ctx.answerPreCheckoutQuery(true));

  bot.on("message:successful_payment", async (ctx) => {
    const sp = ctx.message.successful_payment;
    const userId = ctx.from.id;
    if (sp.invoice_payload === PAYLOAD_PRO) store.grantPro(userId, config.proDays);
    else if (sp.invoice_payload === PAYLOAD_CREDITS) store.grantCredits(userId, config.creditsCount);
    store.recordPayment({
      at: new Date().toISOString(),
      userId,
      stars: sp.total_amount,
      payload: sp.invoice_payload,
      telegramChargeId: sp.telegram_payment_charge_id,
      note: "[line:telegram-bots] telegram stars",
    });
    await ctx.reply(sp.invoice_payload === PAYLOAD_PRO ? "תודה! מנוי הפרו פעיל ל-30 יום ✅" : `תודה! נוספו ${config.creditsCount} שימושים ✅`);
  });

  bot.on("message:text", (ctx) => ctx.reply("לא הבנתי. /help לרשימת הפקודות."));

  return bot;
}
