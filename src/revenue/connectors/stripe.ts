/**
 * Stripe connector — reads balance transactions (read-only).
 *
 * Env: STRIPE_SECRET_KEY (restricted key with balance_transactions read is enough),
 *      STRIPE_DEFAULT_LINE (optional fallback line id).
 * Cursor: unix seconds of the newest transaction seen.
 */

import { extractLineTag, fetchJson, UNASSIGNED_LINE_ID, type RevenueConnector } from "./types.js";
import type { LedgerEntryInput } from "../types.js";

export const stripeConnector: RevenueConnector = {
  source: "stripe",
  isConfigured: (env) => Boolean(env.STRIPE_SECRET_KEY),
  async fetchSince({ cursor, env, resolveLine, fetchImpl = fetch }) {
    const key = env.STRIPE_SECRET_KEY;
    if (!key) return { entries: [], unmapped: [] };
    const since = cursor && /^\d+$/.test(cursor) ? Number(cursor) : Math.floor(Date.now() / 1000) - 30 * 86_400;
    const url = `https://api.stripe.com/v1/balance_transactions?limit=100&created[gt]=${since}`;
    const res = await fetchJson(fetchImpl, url, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok || !Array.isArray(res.body?.data)) return { entries: [], unmapped: [] };

    const entries: LedgerEntryInput[] = [];
    const unmapped = new Set<string>();
    let newest = since;
    for (const tx of res.body.data as any[]) {
      const created = Number(tx.created ?? 0);
      if (created > newest) newest = created;
      const type = String(tx.type ?? "");
      const currency = String(tx.currency ?? "usd").toUpperCase();
      const occurredAt = new Date(created * 1000).toISOString();
      const description = typeof tx.description === "string" ? tx.description : "";
      const lineId = extractLineTag(description)
        ?? resolveLine(`stripe:${description}`)
        ?? env.STRIPE_DEFAULT_LINE
        ?? UNASSIGNED_LINE_ID;
      if (lineId === UNASSIGNED_LINE_ID && description) unmapped.add(`stripe:${description}`);

      if (type === "charge" || type === "payment") {
        entries.push({
          lineId,
          kind: "sale",
          amountMinor: Math.abs(Number(tx.amount ?? 0)),
          currency,
          source: "stripe",
          externalId: String(tx.id),
          occurredAt,
          note: description || null,
        });
        const fee = Math.abs(Number(tx.fee ?? 0));
        if (fee > 0) {
          entries.push({
            lineId,
            kind: "cost",
            amountMinor: fee,
            currency,
            source: "stripe",
            externalId: `${tx.id}:fee`,
            occurredAt,
            note: "stripe fee",
          });
        }
      } else if (type === "refund" || type === "payment_refund") {
        entries.push({
          lineId,
          kind: "refund",
          amountMinor: Math.abs(Number(tx.amount ?? 0)),
          currency,
          source: "stripe",
          externalId: String(tx.id),
          occurredAt,
          note: description || null,
        });
      }
      // payouts/transfers to the bank are not revenue; ignored on purpose.
    }
    return { entries, nextCursor: String(newest), unmapped: [...unmapped] };
  },
};
