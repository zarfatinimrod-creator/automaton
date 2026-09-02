/**
 * Revenue Colony — status rendering for the system prompt and tools.
 */

import type { Database } from "better-sqlite3";
import { listQueuedGoals } from "./goal-queue.js";
import {
  computePortfolioSummary,
  hasRevenueTables,
  isRevenueColonyEnabled,
  latestReviewForLine,
  listLines,
} from "./ledger.js";
import { formatIls } from "./money.js";
import { REVENUE_KV } from "./types.js";

export function getRevenueStatus(db: Database, opts: { maxLines?: number; includeDirective?: boolean } = {}): string {
  try {
    if (!hasRevenueTables(db)) return "";
    if (!isRevenueColonyEnabled(db)) return "Revenue colony: disabled (revenue.enabled=0)";
    const summary = computePortfolioSummary(db);
    const lines = listLines(db);
    if (lines.length === 0) {
      return `Revenue colony: no lines yet. Target ${formatIls(summary.targetMonthlyAgorot)}/mo. The board review will seed the default portfolio; or call revenue_board_review now.`;
    }

    const out: string[] = [];
    out.push(
      `Target ${formatIls(summary.targetMonthlyAgorot)}/mo (stretch ${formatIls(summary.stretchMonthlyAgorot)}) | 30d revenue ${formatIls(summary.total30dAgorot)} (${(summary.attainment * 100).toFixed(1)}%) | run-rate ${formatIls(summary.runRateMonthlyAgorot)}/mo | net ${formatIls(summary.net30dAgorot)}`,
    );
    const counts = Object.entries(summary.counts).filter(([, n]) => n > 0).map(([s, n]) => `${s}:${n}`).join(" ");
    out.push(`Lines: ${counts}`);

    const maxLines = opts.maxLines ?? 12;
    const byId = new Map(summary.lines.map((m) => [m.lineId, m]));
    for (const line of lines.filter((l) => l.status !== "killed").slice(0, maxLines)) {
      const m = byId.get(line.id);
      const last = latestReviewForLine(db, line.id, "supervisor");
      const decision = last ? `${last.decision}` : "unreviewed";
      const setup = line.status === "awaiting_setup" && !line.humanSetupDone ? " [needs creator setup]" : "";
      out.push(
        `- ${line.id} [${line.tier}/${line.status}]${setup} 30d ${formatIls(m?.revenue30dAgorot ?? 0)} of ${formatIls(line.targetMonthlyAgorot)}; budget ${line.budgetMonthlyCents}c; supervisor: ${decision}`,
      );
    }
    const queue = listQueuedGoals(db);
    if (queue.length) out.push(`Goal queue: ${queue.map((q) => `${q.lineId}:${q.phase}`).join(", ")}`);

    const unmappedRow = db.prepare("SELECT value FROM kv WHERE key = ?").get("revenue.unmapped_products") as { value: string } | undefined;
    if (unmappedRow?.value) out.push(`Unmapped products (call revenue_map_product): ${unmappedRow.value.slice(0, 200)}`);

    if (opts.includeDirective !== false) {
      const directive = db.prepare("SELECT value FROM kv WHERE key = ?").get(REVENUE_KV.lastBoardDirective) as { value: string } | undefined;
      if (directive?.value) out.push(`Last board directive:\n${directive.value.slice(0, 900)}`);
    }
    return out.join("\n");
  } catch {
    return "";
  }
}
