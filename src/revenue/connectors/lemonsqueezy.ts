/**
 * Lemon Squeezy connector — reads orders (read-only).
 *
 * Env: LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_DEFAULT_LINE (optional).
 * Product mapping key: `lemonsqueezy:<product_id>`.
 * Cursor: ISO timestamp of the newest order seen.
 */

import { fetchJson, UNASSIGNED_LINE_ID, type RevenueConnector } from "./types.js";
import type { LedgerEntryInput } from "../types.js";

export const lemonSqueezyConnector: RevenueConnector = {
  source: "lemonsqueezy",
  isConfigured: (env) => Boolean(env.LEMONSQUEEZY_API_KEY),
  async fetchSince({ cursor, env, resolveLine, fetchImpl = fetch }) {
    const key = env.LEMONSQUEEZY_API_KEY;
    if (!key) return { entries: [], unmapped: [] };
    const url = "https://api.lemonsqueezy.com/v1/orders?page[size]=100&sort=-created_at";
    const res = await fetchJson(fetchImpl, url, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/vnd.api+json" },
    });
    if (!res.ok || !Array.isArray(res.body?.data)) return { entries: [], unmapped: [] };

    const sinceMs = cursor ? Date.parse(cursor) : Number.NaN;
    const entries: LedgerEntryInput[] = [];
    const unmapped = new Set<string>();
    let newest = Number.isNaN(sinceMs) ? 0 : sinceMs;
    for (const order of res.body.data as any[]) {
      const attrs = order.attributes ?? {};
      const createdMs = Date.parse(String(attrs.created_at ?? ""));
      if (!Number.isNaN(sinceMs) && !Number.isNaN(createdMs) && createdMs <= sinceMs) continue;
      if (createdMs > newest) newest = createdMs;
      const productId = String(attrs.first_order_item?.product_id ?? "");
      const lineId = resolveLine(`lemonsqueezy:${productId}`) ?? env.LEMONSQUEEZY_DEFAULT_LINE ?? UNASSIGNED_LINE_ID;
      if (lineId === UNASSIGNED_LINE_ID && productId) unmapped.add(`lemonsqueezy:${productId}`);
      const currency = String(attrs.currency ?? "USD").toUpperCase();
      const status = String(attrs.status ?? "");
      const occurredAt = Number.isNaN(createdMs) ? new Date().toISOString() : new Date(createdMs).toISOString();
      const total = Math.abs(Number(attrs.total ?? 0));
      if (status === "paid") {
        entries.push({ lineId, kind: "sale", amountMinor: total, currency, source: "lemonsqueezy", externalId: String(order.id), occurredAt, note: attrs.first_order_item?.product_name ?? null });
      } else if (status === "refunded") {
        entries.push({ lineId, kind: "refund", amountMinor: total, currency, source: "lemonsqueezy", externalId: `${order.id}:refund`, occurredAt, note: "refunded" });
      }
    }
    return { entries, nextCursor: newest ? new Date(newest).toISOString() : cursor, unmapped: [...unmapped] };
  },
};
