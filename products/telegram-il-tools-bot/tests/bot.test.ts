import { describe, it, expect, beforeEach } from "vitest";
import type { Bot } from "grammy";
import { createBot, DEFAULT_CONFIG } from "../src/bot.js";
import { Store } from "../src/store.js";

const botInfo = {
  id: 1, is_bot: true as const, first_name: "il-tools", username: "il_tools_bot",
  can_join_groups: true, can_read_all_group_messages: false, supports_inline_queries: false,
  can_connect_to_business: false, has_main_web_app: false,
};

function harness(overrides: Partial<Parameters<typeof createBot>[0]> = {}) {
  const store = new Store();
  const bot = createBot({ token: "test", store, ...DEFAULT_CONFIG, botInfo: botInfo as any, ...overrides });
  const calls: Array<{ method: string; payload: any }> = [];
  bot.api.config.use(async (_prev, method, payload) => {
    calls.push({ method, payload });
    return { ok: true, result: true } as any;
  });
  let updateId = 0;
  const text = async (userId: number, text: string, entities = true) => {
    updateId += 1;
    await bot.handleUpdate({
      update_id: updateId,
      message: {
        message_id: updateId, date: 1_700_000_000, chat: { id: userId, type: "private", first_name: "u" },
        from: { id: userId, is_bot: false, first_name: "u" }, text,
        entities: entities && text.startsWith("/") ? [{ type: "bot_command", offset: 0, length: text.split(" ")[0].length }] : undefined,
      },
    } as any);
  };
  const lastText = () => calls.filter((c) => c.method === "sendMessage").at(-1)?.payload.text as string;
  return { bot, store, calls, text, lastText };
}

describe("il-tools bot", () => {
  let h: ReturnType<typeof harness>;
  beforeEach(() => { h = harness(); });

  it("replies with help on /start", async () => {
    await h.text(10, "/start");
    expect(h.lastText()).toContain("/id");
  });

  it("validates an id and enforces the free daily quota", async () => {
    await h.text(11, "/id 000000018");
    expect(h.lastText()).toContain("✅");
    await h.text(11, "/id 000000019");
    expect(h.lastText()).toContain("❌");
    await h.text(11, "/phone 0501234567");
    expect(h.lastText()).toContain("+972501234567");
    await h.text(11, "/hebdate 2025-09-23");
    expect(h.lastText()).toContain("השימושים החינמיים");
  });

  it("sends a Stars invoice for /pro and grants access after payment", async () => {
    await h.text(12, "/pro");
    const invoice = h.calls.find((c) => c.method === "sendInvoice")!;
    expect(invoice.payload.currency).toBe("XTR");
    expect(invoice.payload.prices[0].amount).toBe(DEFAULT_CONFIG.proStars);
    expect(invoice.payload.provider_token).toBe("");

    await h.bot.handleUpdate({
      update_id: 99,
      message: {
        message_id: 99, date: 1_700_000_000, chat: { id: 12, type: "private", first_name: "u" },
        from: { id: 12, is_bot: false, first_name: "u" },
        successful_payment: {
          currency: "XTR", total_amount: DEFAULT_CONFIG.proStars, invoice_payload: "pro-30d",
          telegram_payment_charge_id: "tg_1", provider_payment_charge_id: "p_1",
        },
      },
    } as any);
    expect(h.store.isPro(12)).toBe(true);
    for (let i = 0; i < 5; i += 1) await h.text(12, "/id 000000018");
    expect(h.lastText()).toContain("✅");
  });

  it("answers pre-checkout queries", async () => {
    await h.bot.handleUpdate({
      update_id: 100,
      pre_checkout_query: { id: "q1", from: { id: 13, is_bot: false, first_name: "u" }, currency: "XTR", total_amount: 50, invoice_payload: "pro-30d" },
    } as any);
    expect(h.calls.some((c) => c.method === "answerPreCheckoutQuery" && c.payload.ok === true)).toBe(true);
  });
});
