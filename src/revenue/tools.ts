/**
 * Revenue Colony — agent tools
 *
 * Read tools are safe/idle-only. Write tools are caution. Board overrides are
 * dangerous because they change money-bearing state; the policy engine and
 * the audit trail both see them.
 */

import type { AutomatonTool, RiskLevel, ToolCategory } from "../types.js";
import { UNASSIGNED_LINE_ID } from "./connectors/index.js";
import { enqueueGoal, feedNextGoal, listQueuedGoals, removeQueuedGoals } from "./goal-queue.js";
import {
  assertLineId,
  computeLineMetrics,
  getLine,
  hasRevenueTables,
  insertLineFromSeed,
  insertReview,
  latestKpis,
  listLedger,
  listLines,
  listReviews,
  mapProductToLine,
  recordKpi,
  recordLedgerEntry,
  setHumanSetupDone,
  setLineTier,
  setTargets,
  updateLineStatus,
} from "./ledger.js";
import { agorotFromIls, formatIls } from "./money.js";
import { renderOrgChart } from "./org.js";
import { runBoardReview, runLedgerSync, requestBoardReview } from "./heartbeat.js";
import { decideLine, describeDecision } from "./rules.js";
import { getRevenueStatus } from "./status.js";
import type { LedgerKind, RevenueCategory, RevenueLineTier } from "./types.js";

const CATEGORY = "revenue" as ToolCategory;

const LEDGER_KINDS: LedgerKind[] = ["sale", "subscription", "payout", "refund", "cost"];
const TIERS: RevenueLineTier[] = ["core", "growth", "experimental"];
const CATEGORIES: RevenueCategory[] = ["digital_product", "micro_saas", "paid_api", "agent_service", "content", "service", "other"];

function requireTables(db: import("better-sqlite3").Database): string | null {
  return hasRevenueTables(db) ? null : "Error: revenue tables are missing (schema v12). Restart the runtime to apply migrations.";
}

function str(args: Record<string, unknown>, key: string): string {
  const v = args[key];
  return typeof v === "string" ? v.trim() : "";
}

function num(args: Record<string, unknown>, key: string): number | null {
  const v = args[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function strArray(args: Record<string, unknown>, key: string): string[] {
  const v = args[key];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean);
  if (typeof v === "string" && v.trim()) return v.split("|").map((x) => x.trim()).filter(Boolean);
  return [];
}

export function createRevenueTools(): AutomatonTool[] {
  return [
    {
      name: "revenue_status",
      description:
        "Portfolio status of the revenue colony: target vs 30-day revenue, run-rate, every line's status and last supervisor decision, the goal queue, and the last board directive. Read this before any revenue decision.",
      category: CATEGORY,
      riskLevel: "safe" as RiskLevel,
      parameters: { type: "object", properties: {} },
      execute: async (_args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        const status = getRevenueStatus(ctx.db.raw, { maxLines: 30 });
        return status || "Revenue colony: no data.";
      },
    },
    {
      name: "revenue_lines",
      description: "List revenue lines with tier, status, target, budget, human setup requirements and whether setup is done.",
      category: CATEGORY,
      riskLevel: "safe" as RiskLevel,
      parameters: {
        type: "object",
        properties: {
          include_killed: { type: "boolean", description: "Include killed lines (default false)" },
        },
      },
      execute: async (args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        const includeKilled = args.include_killed === true;
        const lines = listLines(ctx.db.raw).filter((l) => includeKilled || l.status !== "killed");
        if (lines.length === 0) return "No revenue lines. Run revenue_board_review to seed the default portfolio.";
        return lines.map((l) => {
          const setup = l.humanSetup.length
            ? ` | human setup ${l.humanSetupDone ? "DONE" : "PENDING"}: ${l.humanSetup.join("; ")}`
            : " | no human setup needed";
          return `${l.id} — ${l.name} [${l.category}/${l.tier}/${l.status}] target ${formatIls(l.targetMonthlyAgorot)} budget ${l.budgetMonthlyCents}c${setup}`;
        }).join("\n") + "\n\nOrg chart:\n" + renderOrgChart(lines);
      },
    },
    {
      name: "revenue_line_detail",
      description: "Full detail for one revenue line: operating loop, KPIs, kill/scale criteria, 30-day metrics, latest KPI snapshots, recent ledger entries, recent reviews, and the decision the rules would make right now.",
      category: CATEGORY,
      riskLevel: "safe" as RiskLevel,
      parameters: {
        type: "object",
        properties: { line_id: { type: "string", description: "Revenue line id" } },
        required: ["line_id"],
      },
      execute: async (args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        const line = getLine(ctx.db.raw, str(args, "line_id"));
        if (!line) return `Error: no revenue line "${str(args, "line_id")}".`;
        const metrics = computeLineMetrics(ctx.db.raw, line);
        const decision = decideLine(line, metrics);
        const kpis = latestKpis(ctx.db.raw, line.id);
        const ledger = listLedger(ctx.db.raw, { lineId: line.id, limit: 10 });
        const reviews = listReviews(ctx.db.raw, { lineId: line.id, limit: 5 });
        return [
          `${line.id} — ${line.name} [${line.category}/${line.tier}/${line.status}] director ${line.directorRole}`,
          `Target ${formatIls(line.targetMonthlyAgorot)}/mo | budget ${line.budgetMonthlyCents}c/mo | launched ${line.launchedAt ?? "not yet"}`,
          `Human setup: ${line.humanSetup.length ? `${line.humanSetupDone ? "DONE" : "PENDING"} — ${line.humanSetup.join("; ")}` : "none"}`,
          "",
          `Operating loop: ${line.operatingLoop}`,
          `KPIs: ${line.kpis.join(" | ")}`,
          `Kill criteria: ${line.killCriteria.join(" | ")}`,
          `Scale criteria: ${line.scaleCriteria.join(" | ")}`,
          "",
          `30d revenue ${formatIls(metrics.revenue30dAgorot)} (refunds ${formatIls(metrics.refunds30dAgorot)}, costs ${formatIls(metrics.cost30dAgorot)}, net ${formatIls(metrics.net30dAgorot)}) | 7d ${formatIls(metrics.revenue7dAgorot)} | trend ${metrics.trend} | tx ${metrics.transactions30d} | attainment ${(metrics.targetAttainment * 100).toFixed(1)}%`,
          `Days: created ${metrics.daysSinceCreated.toFixed(0)}, live ${metrics.daysSinceLaunch?.toFixed(0) ?? "-"}, since last revenue ${metrics.daysSinceLastRevenue?.toFixed(0) ?? "-"}`,
          `Rules now: ${describeDecision(decision)}`,
          "",
          `Latest KPIs: ${Object.keys(kpis).length ? Object.entries(kpis).map(([k, v]) => `${k}=${v.value}${v.unit ?? ""} (${v.capturedAt.slice(0, 10)})`).join(", ") : "none"}`,
          `Recent ledger: ${ledger.length ? ledger.map((e) => `${e.occurredAt.slice(0, 10)} ${e.kind} ${formatIls(e.amountAgorot)} via ${e.source}${e.note ? ` (${e.note.slice(0, 40)})` : ""}`).join("; ") : "none"}`,
          `Recent reviews: ${reviews.length ? reviews.map((r) => `${r.createdAt.slice(0, 10)} ${r.level}:${r.decision}`).join("; ") : "none"}`,
        ].join("\n");
      },
    },
    {
      name: "revenue_record",
      description:
        "Record money in the revenue ledger. Use for every sale, subscription payment, refund, payout and cost of a line. Amount is in MINOR units (cents/agorot). Always pass external_id (platform transaction id) so re-recording is a no-op. Never record projected or promised money.",
      category: CATEGORY,
      riskLevel: "caution" as RiskLevel,
      parameters: {
        type: "object",
        properties: {
          line_id: { type: "string", description: "Revenue line id" },
          kind: { type: "string", enum: LEDGER_KINDS, description: "sale | subscription | payout | refund | cost" },
          amount_minor: { type: "number", description: "Integer amount in minor units (e.g. 1990 for $19.90)" },
          currency: { type: "string", description: "ILS | USD | USDC | EUR | GBP" },
          source: { type: "string", description: "stripe | lemonsqueezy | gumroad | paddle | x402 | conway | manual | <platform>" },
          external_id: { type: "string", description: "Platform transaction id (idempotency key)" },
          occurred_at: { type: "string", description: "ISO timestamp (default now)" },
          note: { type: "string", description: "Short note (product name, customer type)" },
        },
        required: ["line_id", "kind", "amount_minor", "currency", "source"],
      },
      execute: async (args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        const lineId = str(args, "line_id");
        if (lineId !== UNASSIGNED_LINE_ID && !getLine(ctx.db.raw, lineId)) return `Error: no revenue line "${lineId}".`;
        const kind = str(args, "kind") as LedgerKind;
        if (!LEDGER_KINDS.includes(kind)) return `Error: kind must be one of ${LEDGER_KINDS.join(", ")}.`;
        const amount = num(args, "amount_minor");
        if (amount === null || !Number.isInteger(amount) || amount === 0) return "Error: amount_minor must be a non-zero integer.";
        const currency = str(args, "currency").toUpperCase();
        if (!currency) return "Error: currency is required.";
        const source = str(args, "source");
        if (!source) return "Error: source is required.";
        try {
          const entry = recordLedgerEntry(ctx.db.raw, {
            lineId,
            kind,
            amountMinor: amount,
            currency,
            source,
            externalId: str(args, "external_id") || null,
            occurredAt: str(args, "occurred_at") || undefined,
            note: str(args, "note") || null,
          });
          if (!entry) return `Duplicate: ${source}/${str(args, "external_id")} was already recorded. Nothing changed.`;
          return `Recorded ${entry.kind} ${formatIls(entry.amountAgorot)} (${entry.amountMinor} ${entry.currency}) on ${entry.lineId} via ${entry.source} [${entry.id}].`;
        } catch (error) {
          return `Error: ${(error as Error).message}`;
        }
      },
    },
    {
      name: "revenue_kpi",
      description: "Snapshot a KPI value for a revenue line (visitors, installs, API calls, conversion rate...). Supervisors read these; record them at least daily while a line is active.",
      category: CATEGORY,
      riskLevel: "safe" as RiskLevel,
      parameters: {
        type: "object",
        properties: {
          line_id: { type: "string" },
          kpi: { type: "string", description: "KPI name as listed on the line" },
          value: { type: "number" },
          unit: { type: "string", description: "Optional unit (count, %, ms, ILS)" },
        },
        required: ["line_id", "kpi", "value"],
      },
      execute: async (args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        const lineId = str(args, "line_id");
        if (!getLine(ctx.db.raw, lineId)) return `Error: no revenue line "${lineId}".`;
        const value = num(args, "value");
        const kpi = str(args, "kpi");
        if (!kpi || value === null) return "Error: kpi and numeric value are required.";
        recordKpi(ctx.db.raw, lineId, kpi, value, str(args, "unit") || undefined);
        return `KPI recorded: ${lineId}.${kpi} = ${value}${str(args, "unit")}`;
      },
    },
    {
      name: "revenue_map_product",
      description: "Map a platform product id to a revenue line so synced sales land on the right line. Key format: '<source>:<product id>' (e.g. 'gumroad:abc123', 'lemonsqueezy:98765', 'stripe:<description>').",
      category: CATEGORY,
      riskLevel: "safe" as RiskLevel,
      parameters: {
        type: "object",
        properties: {
          source: { type: "string" },
          product_id: { type: "string" },
          line_id: { type: "string" },
        },
        required: ["source", "product_id", "line_id"],
      },
      execute: async (args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        const lineId = str(args, "line_id");
        if (!getLine(ctx.db.raw, lineId)) return `Error: no revenue line "${lineId}".`;
        mapProductToLine(ctx.db.raw, str(args, "source").toLowerCase(), str(args, "product_id"), lineId);
        return `Mapped ${str(args, "source").toLowerCase()}:${str(args, "product_id")} → ${lineId}. Future synced sales for this product will be recorded on that line.`;
      },
    },
    {
      name: "revenue_launch_line",
      description: "Queue the build goal for a proposed/paused line (or a line whose human setup is done). The board feeds it to the orchestrator when no other goal is active.",
      category: CATEGORY,
      riskLevel: "caution" as RiskLevel,
      parameters: {
        type: "object",
        properties: {
          line_id: { type: "string" },
          note: { type: "string", description: "Optional note for the director" },
        },
        required: ["line_id"],
      },
      execute: async (args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        const line = getLine(ctx.db.raw, str(args, "line_id"));
        if (!line) return `Error: no revenue line "${str(args, "line_id")}".`;
        if (line.status === "killed") return `Error: ${line.id} is killed. Propose a new line instead.`;
        if (line.humanSetup.length > 0 && !line.humanSetupDone) {
          return `Blocked: ${line.id} needs one-time creator setup first: ${line.humanSetup.join("; ")}. The creator confirms with revenue_setup_done.`;
        }
        if (line.status === "paused") updateLineStatus(ctx.db.raw, line.id, "proposed");
        const queued = enqueueGoal(ctx.db.raw, { lineId: line.id, phase: line.status === "live" || line.status === "scaling" ? "grow" : "build", extra: str(args, "note") || undefined });
        const fed = feedNextGoal(ctx.db.raw);
        const queue = listQueuedGoals(ctx.db.raw);
        return [
          queued ? `Queued goal for ${line.id}.` : `A goal for ${line.id} was already queued or active.`,
          fed ? `Filed goal ${fed.goalId} (${fed.phase}) for ${fed.lineId} — the orchestrator will plan it next tick.` : `Orchestrator busy; ${queue.length} goal(s) waiting in the queue.`,
        ].join(" ");
      },
    },
    {
      name: "revenue_setup_done",
      description:
        "Mark a line's one-time human setup as done (or undone). Only call this after the creator explicitly confirmed the accounts exist and payouts are connected; never mark setup done on your own initiative.",
      category: CATEGORY,
      riskLevel: "caution" as RiskLevel,
      parameters: {
        type: "object",
        properties: {
          line_id: { type: "string" },
          done: { type: "boolean", description: "true when confirmed by the creator" },
          evidence: { type: "string", description: "Where the creator confirmed it (message id / date)" },
        },
        required: ["line_id", "done"],
      },
      execute: async (args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        const line = getLine(ctx.db.raw, str(args, "line_id"));
        if (!line) return `Error: no revenue line "${str(args, "line_id")}".`;
        const done = args.done === true;
        const evidence = str(args, "evidence");
        if (done && !evidence) return "Error: pass evidence (where/when the creator confirmed) when marking setup done.";
        setHumanSetupDone(ctx.db.raw, line.id, done);
        insertReview(ctx.db.raw, {
          lineId: line.id,
          level: "board",
          reviewer: ctx.identity.name,
          periodStart: new Date().toISOString(),
          periodEnd: new Date().toISOString(),
          metrics: { humanSetupDone: done, evidence },
          decision: done ? "approve" : "escalate",
          rationale: done ? `creator confirmed one-time setup: ${evidence}` : "creator setup marked incomplete",
        });
        if (done) {
          if (line.status === "awaiting_setup") updateLineStatus(ctx.db.raw, line.id, "proposed");
          enqueueGoal(ctx.db.raw, { lineId: line.id, phase: "build" });
          const fed = feedNextGoal(ctx.db.raw);
          return `Setup marked done for ${line.id}. ${fed ? `Build goal ${fed.goalId} filed.` : "Build goal queued; the board will file it when the orchestrator is free."}`;
        }
        if (line.status !== "awaiting_setup" && line.status !== "killed") updateLineStatus(ctx.db.raw, line.id, "awaiting_setup", { force: true });
        removeQueuedGoals(ctx.db.raw, line.id);
        return `Setup marked incomplete for ${line.id}; line parked in awaiting_setup.`;
      },
    },
    {
      name: "revenue_decide",
      description:
        "File a chain-of-command decision. level=supervisor files a review only (the board acts on it). level=board applies it: kill | pause | resume | scale | escalate, plus optional tier change. Every decision needs a rationale grounded in the ledger; it is audited.",
      category: CATEGORY,
      riskLevel: "dangerous" as RiskLevel,
      parameters: {
        type: "object",
        properties: {
          line_id: { type: "string" },
          level: { type: "string", enum: ["supervisor", "board"], description: "Who is deciding" },
          decision: { type: "string", enum: ["hold", "scale", "pivot", "kill", "escalate", "pause", "resume"], description: "supervisor: hold|scale|pivot|kill|escalate; board: kill|pause|resume|scale|escalate|hold" },
          rationale: { type: "string", description: "Ledger-based reason; for escalate, the exact human steps needed" },
          tier: { type: "string", enum: TIERS, description: "Optional new tier (board only)" },
        },
        required: ["line_id", "level", "decision", "rationale"],
      },
      execute: async (args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        const db = ctx.db.raw;
        const line = getLine(db, str(args, "line_id"));
        if (!line) return `Error: no revenue line "${str(args, "line_id")}".`;
        const level = str(args, "level");
        const decision = str(args, "decision");
        const rationale = str(args, "rationale");
        if (rationale.length < 20) return "Error: rationale must be at least 20 characters and cite the numbers.";
        const metrics = computeLineMetrics(db, line);
        const now = new Date().toISOString();

        if (level === "supervisor") {
          if (!["hold", "scale", "pivot", "kill", "escalate"].includes(decision)) return "Error: supervisor decisions are hold|scale|pivot|kill|escalate.";
          insertReview(db, {
            lineId: line.id,
            level: "supervisor",
            reviewer: `supervisor-${line.id}`,
            periodStart: now,
            periodEnd: now,
            metrics: { ...metrics, filedBy: ctx.identity.name },
            decision: decision as any,
            rationale,
          });
          if (decision !== "hold") requestBoardReview(db, `supervisor filed ${decision} for ${line.id}`);
          return `Supervisor review filed for ${line.id}: ${decision}. ${decision !== "hold" ? "Board review requested." : ""}`.trim();
        }

        if (level !== "board") return "Error: level must be supervisor or board.";
        const actions: string[] = [];
        switch (decision) {
          case "kill":
            updateLineStatus(db, line.id, "killed", { reason: rationale, force: true });
            removeQueuedGoals(db, line.id);
            actions.push("line killed; queued goals removed");
            break;
          case "pause":
            if (line.status !== "killed") updateLineStatus(db, line.id, "paused", { force: true });
            removeQueuedGoals(db, line.id);
            actions.push("line paused");
            break;
          case "resume":
            if (line.status === "paused") {
              updateLineStatus(db, line.id, line.launchedAt ? "live" : "proposed");
              actions.push(`line resumed as ${line.launchedAt ? "live" : "proposed"}`);
            } else actions.push("line was not paused; no status change");
            break;
          case "scale":
            if (line.status === "live") updateLineStatus(db, line.id, "scaling");
            enqueueGoal(db, { lineId: line.id, phase: "grow", extra: rationale });
            actions.push("scaling; grow goal queued");
            break;
          case "escalate":
            if (line.status !== "killed" && line.status !== "awaiting_setup") updateLineStatus(db, line.id, "awaiting_setup", { force: true });
            setHumanSetupDone(db, line.id, false);
            removeQueuedGoals(db, line.id);
            actions.push("parked in awaiting_setup for the creator");
            break;
          case "hold":
            actions.push("no status change");
            break;
          default:
            return "Error: board decisions are kill|pause|resume|scale|escalate|hold.";
        }
        const tier = str(args, "tier") as RevenueLineTier;
        if (tier && TIERS.includes(tier) && tier !== line.tier) {
          setLineTier(db, line.id, tier);
          actions.push(`tier ${line.tier} → ${tier}`);
        }
        insertReview(db, {
          lineId: line.id,
          level: "board",
          reviewer: ctx.identity.name,
          periodStart: now,
          periodEnd: now,
          metrics: { ...metrics, actions },
          decision: (decision === "pause" || decision === "resume" ? "hold" : decision) as any,
          rationale,
        });
        return `Board decision on ${line.id}: ${decision}. ${actions.join("; ")}.`;
      },
    },
    {
      name: "revenue_propose_line",
      description:
        "Propose a new revenue line the board can launch. Use when you discover a concrete, honest, market-validated opportunity. Provide the operating loop, KPIs, kill and scale criteria, target and the exact one-time human setup (empty if none).",
      category: CATEGORY,
      riskLevel: "caution" as RiskLevel,
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "slug: lowercase letters, digits, dashes" },
          name: { type: "string" },
          category: { type: "string", enum: CATEGORIES },
          tier: { type: "string", enum: TIERS },
          operating_loop: { type: "string", description: "What the director does every cycle, concretely" },
          kpis: { type: "array", items: { type: "string" } },
          kill_criteria: { type: "array", items: { type: "string" } },
          scale_criteria: { type: "array", items: { type: "string" } },
          target_monthly_ils: { type: "number" },
          human_setup: { type: "array", items: { type: "string" }, description: "One-time creator actions; [] if none" },
        },
        required: ["id", "name", "category", "tier", "operating_loop", "kpis", "kill_criteria", "scale_criteria", "target_monthly_ils"],
      },
      execute: async (args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        try {
          const id = assertLineId(str(args, "id"));
          const category = str(args, "category") as RevenueCategory;
          const tier = str(args, "tier") as RevenueLineTier;
          if (!CATEGORIES.includes(category)) return `Error: category must be one of ${CATEGORIES.join(", ")}.`;
          if (!TIERS.includes(tier)) return `Error: tier must be one of ${TIERS.join(", ")}.`;
          const target = num(args, "target_monthly_ils");
          if (target === null || target <= 0) return "Error: target_monthly_ils must be positive.";
          const loop = str(args, "operating_loop");
          if (loop.length < 80) return "Error: operating_loop must describe the loop concretely (80+ characters).";
          const inserted = insertLineFromSeed(ctx.db.raw, {
            id,
            name: str(args, "name"),
            category,
            tier,
            directorRole: `director-${id}`,
            operatingLoop: loop,
            kpis: strArray(args, "kpis"),
            killCriteria: strArray(args, "kill_criteria"),
            scaleCriteria: strArray(args, "scale_criteria"),
            targetMonthlyAgorot: agorotFromIls(target),
            budgetMonthlyCents: 1000,
            humanSetup: strArray(args, "human_setup"),
            skillName: null,
          });
          if (!inserted) return `Error: a line with id "${id}" already exists.`;
          const line = getLine(ctx.db.raw, id)!;
          return `Proposed line ${id} (${line.status}). ${line.humanSetup.length ? "Blocked on creator setup: " + line.humanSetup.join("; ") : "The board can launch it with revenue_launch_line."}`;
        } catch (error) {
          return `Error: ${(error as Error).message}`;
        }
      },
    },
    {
      name: "revenue_set_target",
      description: "Set the portfolio monthly target (and optional stretch target) in ILS. Board only.",
      category: CATEGORY,
      riskLevel: "caution" as RiskLevel,
      parameters: {
        type: "object",
        properties: {
          target_monthly_ils: { type: "number" },
          stretch_monthly_ils: { type: "number" },
        },
        required: ["target_monthly_ils"],
      },
      execute: async (args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        const target = num(args, "target_monthly_ils");
        const stretch = num(args, "stretch_monthly_ils");
        if (target === null || target <= 0) return "Error: target_monthly_ils must be positive.";
        try {
          setTargets(ctx.db.raw, agorotFromIls(target), stretch === null ? undefined : agorotFromIls(stretch));
          return `Target set to ${formatIls(agorotFromIls(target))}/mo${stretch !== null ? `, stretch ${formatIls(agorotFromIls(stretch))}/mo` : ""}.`;
        } catch (error) {
          return `Error: ${(error as Error).message}`;
        }
      },
    },
    {
      name: "revenue_board_review",
      description: "Run the board review now: seed the portfolio if empty, apply decision rules to every line, reallocate budget, queue and file goals. Normally runs daily from the heartbeat; call it manually after the creator completes setup or when you need to act on an escalation immediately.",
      category: CATEGORY,
      riskLevel: "caution" as RiskLevel,
      parameters: { type: "object", properties: {} },
      execute: async (_args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        const result = runBoardReview(ctx.db.raw);
        if (!result.ran) return "Board review did not run (revenue colony disabled).";
        return result.directive;
      },
    },
    {
      name: "revenue_sync_ledger",
      description: "Pull recent money events from configured payment platforms (Stripe, Lemon Squeezy, Gumroad via env keys) and tagged x402 transfers into the ledger. Idempotent.",
      category: CATEGORY,
      riskLevel: "safe" as RiskLevel,
      parameters: { type: "object", properties: {} },
      execute: async (_args, ctx) => {
        const missing = requireTables(ctx.db.raw);
        if (missing) return missing;
        const result = await runLedgerSync(ctx.db.raw);
        return `Ledger sync: ${result.recorded} new, ${result.duplicates} duplicates, sources [${result.sources.join(", ") || "none configured"}]${result.unmapped.length ? `, unmapped: ${result.unmapped.join(", ")}` : ""}${result.errors.length ? `, errors: ${result.errors.join("; ")}` : ""}.`;
      },
    },
  ];
}
