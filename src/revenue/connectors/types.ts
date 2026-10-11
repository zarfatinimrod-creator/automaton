import type { LedgerEntryInput } from "../types.js";

export interface ConnectorFetchResult {
  entries: LedgerEntryInput[];
  nextCursor?: string;
  /** Product identifiers seen that had no line mapping (for the board to map). */
  unmapped: string[];
  /**
   * Set when the platform's listing could not be read to its end (a page refused, more pages than the cap): `entries`
   * holds what was read and `nextCursor` passes no sale that was not. The sync reports it in its errors as
   * `<source>: <problem>`, beside a connector's thrown error (tick 71, the Gumroad connector).
   */
  problem?: string;
}

export interface RevenueConnector {
  source: string;
  /** True when the credentials this connector needs are present in the environment. */
  isConfigured(env: NodeJS.ProcessEnv): boolean;
  /**
   * Fetch ledger entries newer than `cursor`. Implementations must be
   * read-only, idempotent (external ids), and must never throw on HTTP
   * errors — return what was read (with `problem` when the listing stopped
   * short, or an empty result) and let the caller log.
   */
  fetchSince(params: {
    cursor: string | undefined;
    env: NodeJS.ProcessEnv;
    resolveLine: (productKey: string) => string | undefined;
    fetchImpl?: typeof fetch;
  }): Promise<ConnectorFetchResult>;
}

export const UNASSIGNED_LINE_ID = "unassigned";

export async function fetchJson(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ ok: boolean; status: number; body: any }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), init.timeoutMs ?? 10_000);
  try {
    const res = await fetchImpl(url, { ...init, signal: controller.signal });
    let body: any = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    return { ok: res.ok, status: res.status, body };
  } catch {
    return { ok: false, status: 0, body: null };
  } finally {
    clearTimeout(timer);
  }
}

/** Extract a `[line:<id>]` tag from free text (descriptions, memos, notes). */
export function extractLineTag(text: unknown): string | undefined {
  if (typeof text !== "string") return undefined;
  const match = /\[line:([a-z0-9][a-z0-9-]{1,63})\]/i.exec(text);
  return match ? match[1].toLowerCase() : undefined;
}
