/**
 * Gumroad connector — reads sales (read-only).
 *
 * Env: GUMROAD_ACCESS_TOKEN, GUMROAD_DEFAULT_LINE (optional).
 * Product mapping key: `gumroad:<product_id>`.
 * Cursor: YYYY-MM-DD of the newest sale seen (Gumroad filters by day).
 *
 * The same sync also reads the Pro product's refund rate over the trailing 90 days (`gumroadRefundRate90d`,
 * RULING-2026-09-30-documents (d) and fold action 6): refunded / sales, a number for the board and never a reason to
 * refuse a refund. The fields are Gumroad's API v2 sale object as its public source writes it (antiwork/gumroad
 * 0656875c5fbfbf1a7f339f4716a0b9059539d790, app/models/purchase.rb#as_json, version 2): `created_at` (:1018),
 * `product_id: link.external_id` (:1050), `refunded: stripe_refunded` (:1052), `partially_refunded:
 * stripe_partially_refunded` (:1053). The index (app/controllers/api/v2/sales_controller.rb) filters `created_at >=
 * after` (:282) and `link_id` on `product_id` (:285), answers ten sales a page (RESULTS_PER_PAGE, :14) and pages with
 * `next_page_key` / `page_key` (base_controller.rb:163-167, sales_controller.rb:91-98); every answer carries
 * `success` (base_controller.rb:42-44).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
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

// ─── The Pro product's refund rate (RULING-2026-09-30-documents (d), fold action 6) ─────────────────────────────

export const GUMROAD_REFUND_RATE_KPI = "gumroadRefundRate90d";
export const REFUND_RATE_WINDOW_DAYS = 90;
/** The line the Pro product belongs to when the product map does not name one: site.json is il-biz-tools' own. */
export const PRO_LINE_ID = "il-biz-tools";
export const DEFAULT_PRO_SITE_DIR = join("products", "il-biz-tools");
/** Ten sales a page (sales_controller.rb:14): 100 pages is 1,000 sales in 90 days. Past it the count is not complete. */
export const MAX_REFUND_RATE_PAGES = 100;

const DAY_MS = 86_400_000;

export interface RefundRateCount {
  /** Sales of the Pro product created inside the window. */
  sales: number;
  /** Of those, the ones Gumroad reports wholly refunded (`refunded`). */
  refunded: number;
  /**
   * Of those, the ones Gumroad reports partly refunded (`partially_refunded`). Counted as sales and NOT as refunded: the
   * ruling's measure is `refunded`, and Gumroad sets `refunded` only once the refunds cover the whole charge, with
   * `partially_refunded` otherwise, never both (antiwork/gumroad app/modules/purchase/refundable.rb:317-318, :406-412).
   */
  partiallyRefunded: number;
  /** Pro sales with no readable `created_at`: they cannot be placed in the window, so they are left out and counted here. */
  undated: number;
  windowDays: number;
  /** The window's end: the sync's own time. Its start is `windowDays` before it, inclusive. */
  windowEnd: string;
}

/**
 * Count the Pro product's sales and refunds in the trailing window, measured from each sale's own `created_at`: a
 * sale counts when `windowEnd - windowDays <= created_at <= windowEnd`. Sales of any other product are left out, even
 * when Gumroad returns them.
 */
export function countProRefunds(
  sales: readonly unknown[],
  productId: string,
  nowIso: string,
  windowDays: number = REFUND_RATE_WINDOW_DAYS,
): RefundRateCount {
  const end = Date.parse(nowIso);
  const start = end - windowDays * DAY_MS;
  const out: RefundRateCount = { sales: 0, refunded: 0, partiallyRefunded: 0, undated: 0, windowDays, windowEnd: new Date(end).toISOString() };
  for (const raw of sales) {
    if (!raw || typeof raw !== "object") continue;
    const sale = raw as Record<string, unknown>;
    if (String(sale.product_id ?? "") !== productId) continue;
    const t = typeof sale.created_at === "string" ? Date.parse(sale.created_at) : Number.NaN;
    if (Number.isNaN(t)) {
      out.undated += 1;
      continue;
    }
    if (t < start || t > end) continue;
    out.sales += 1;
    if (sale.refunded === true) out.refunded += 1;
    else if (sale.partially_refunded === true) out.partiallyRefunded += 1;
  }
  return out;
}

/** refunded / sales, or null when there is no sale to divide by. Never NaN, never Infinity. */
export function refundRate(count: Pick<RefundRateCount, "sales" | "refunded">): number | null {
  return count.sales > 0 ? count.refunded / count.sales : null;
}

/** The KPI row's unit carries its two counts, the product, the window and the partly refunded count. */
export function refundRateUnit(count: RefundRateCount, productId: string): string {
  return (
    `refunded ${count.refunded} of ${count.sales} sales · gumroad:${productId} · ` +
    `${count.windowDays} days to ${count.windowEnd} · partly refunded ${count.partiallyRefunded}`
  );
}

const REFUND_RATE_UNIT_RE = /^refunded (\d+) of (\d+) sales · (gumroad:\S*) · (\d+) days to (\S+) · partly refunded (\d+)$/;

export interface RefundRateUnit {
  refunded: number;
  sales: number;
  productKey: string;
  windowDays: number;
  windowEnd: string;
  partiallyRefunded: number;
}

export function parseRefundRateUnit(unit: unknown): RefundRateUnit | null {
  const m = typeof unit === "string" ? REFUND_RATE_UNIT_RE.exec(unit) : null;
  if (!m) return null;
  return {
    refunded: Number(m[1]),
    sales: Number(m[2]),
    productKey: m[3]!,
    windowDays: Number(m[4]),
    windowEnd: m[5]!,
    partiallyRefunded: Number(m[6]),
  };
}

/** The Pro product's Gumroad id from the site's config (written by the product-creation job), or "" while unset. */
export function readProProductId(siteDir: string = DEFAULT_PRO_SITE_DIR): { productId: string; problem: string | null } {
  try {
    const raw = JSON.parse(readFileSync(join(siteDir, "src", "config", "site.json"), "utf8")) as { gumroad?: { productId?: unknown } };
    const id = raw.gumroad?.productId;
    return { productId: typeof id === "string" ? id.trim() : "", problem: null };
  } catch (error) {
    return { productId: "", problem: `site.json unreadable (${(error as Error).message})` };
  }
}

/**
 * Read every Pro sale Gumroad lists from one day before the window (so the day filter's time zone never cuts off a sale
 * inside it), then count exactly on each sale's own time. A refused page, or more pages than MAX_REFUND_RATE_PAGES, is
 * an error: a partial count is never passed off as a rate.
 */
export async function readProRefundCount(params: {
  token: string;
  productId: string;
  nowIso: string;
  fetchImpl?: typeof fetch;
}): Promise<{ ok: true; count: RefundRateCount } | { ok: false; detail: string }> {
  const { token, productId, nowIso, fetchImpl = fetch } = params;
  const after = new Date(Date.parse(nowIso) - (REFUND_RATE_WINDOW_DAYS + 1) * DAY_MS).toISOString().slice(0, 10);
  const sales: unknown[] = [];
  let pageKey: string | null = null;
  for (let page = 1; page <= MAX_REFUND_RATE_PAGES; page += 1) {
    const q = new URLSearchParams({ access_token: token, product_id: productId, after });
    if (pageKey) q.set("page_key", pageKey);
    const res = await fetchJson(fetchImpl, `https://api.gumroad.com/v2/sales?${q}`);
    if (!res.ok || res.body?.success !== true || !Array.isArray(res.body.sales)) {
      return { ok: false, detail: `GET /v2/sales for the Pro product was refused (HTTP ${res.status}, page ${page})` };
    }
    sales.push(...res.body.sales);
    pageKey = typeof res.body.next_page_key === "string" && res.body.next_page_key ? res.body.next_page_key : null;
    if (!pageKey) return { ok: true, count: countProRefunds(sales, productId, nowIso) };
  }
  return { ok: false, detail: `more than ${MAX_REFUND_RATE_PAGES} pages of Pro sales since ${after}, so the count would not be complete` };
}
