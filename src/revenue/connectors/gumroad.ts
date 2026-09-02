/**
 * Gumroad connector — reads sales (read-only).
 *
 * Env: GUMROAD_ACCESS_TOKEN, GUMROAD_DEFAULT_LINE (optional).
 * Product mapping key: `gumroad:<product_id>`.
 * Cursor: YYYY-MM-DD of the newest sale seen (Gumroad filters by day).
 */

import { fetchJson, UNASSIGNED_LINE_ID, type RevenueConnector } from "./types.js";
import type { LedgerEntryInput } from "../types.js";

export const gumroadConnector: RevenueConnector = {
  source: "gumroad",
  isConfigured: (env) => Boolean(env.GUMROAD_ACCESS_TOKEN),
  async fetchSince({ cursor, env, resolveLine, fetchImpl = fetch }) {
    const token = env.GUMROAD_ACCESS_TOKEN;
    if (!token) return { entries: [], unmapped: [] };
    const after = cursor && /^\d{4}-\d{2}-\d{2}$/.test(cursor)
      ? cursor
      : new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
    const url = `https://api.gumroad.com/v2/sales?access_token=${encodeURIComponent(token)}&after=${after}`;
    const res = await fetchJson(fetchImpl, url);
    if (!res.ok || !Array.isArray(res.body?.sales)) return { entries: [], unmapped: [] };

    const entries: LedgerEntryInput[] = [];
    const unmapped = new Set<string>();
    let newestDay = after;
    for (const sale of res.body.sales as any[]) {
      const productId = String(sale.product_id ?? "");
      const lineId = resolveLine(`gumroad:${productId}`) ?? env.GUMROAD_DEFAULT_LINE ?? UNASSIGNED_LINE_ID;
      if (lineId === UNASSIGNED_LINE_ID && productId) unmapped.add(`gumroad:${productId}`);
      const createdAt = String(sale.created_at ?? "");
      const day = createdAt.slice(0, 10);
      if (day > newestDay) newestDay = day;
      const price = Math.abs(Number(sale.price ?? 0)); // cents
      const currency = String(sale.currency ?? "usd").toUpperCase();
      const occurredAt = Number.isNaN(Date.parse(createdAt)) ? new Date().toISOString() : new Date(createdAt).toISOString();
      entries.push({ lineId, kind: "sale", amountMinor: price, currency, source: "gumroad", externalId: String(sale.id), occurredAt, note: sale.product_name ?? null });
      if (sale.refunded === true) {
        entries.push({ lineId, kind: "refund", amountMinor: price, currency, source: "gumroad", externalId: `${sale.id}:refund`, occurredAt, note: "refunded" });
      }
      const fee = Math.abs(Number(sale.gumroad_fee ?? 0));
      if (fee > 0) {
        entries.push({ lineId, kind: "cost", amountMinor: fee, currency, source: "gumroad", externalId: `${sale.id}:fee`, occurredAt, note: "gumroad fee" });
      }
    }
    return { entries, nextCursor: newestDay, unmapped: [...unmapped] };
  },
};
