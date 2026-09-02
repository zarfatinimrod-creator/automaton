/**
 * Revenue Colony — goal queue
 *
 * The orchestrator processes one goal at a time. The board therefore keeps a
 * FIFO queue of (line, phase) goals in KV and feeds the next one only when the
 * orchestrator has no active goal.
 */

import type { Database } from "better-sqlite3";
import { getActiveGoals } from "../state/database.js";
import { createGoal } from "../orchestration/task-graph.js";
import { getLine, updateLineStatus } from "./ledger.js";
import { buildGoalSpec, type GoalPhase } from "./org.js";
import { REVENUE_KV } from "./types.js";

export interface QueuedGoal {
  lineId: string;
  phase: GoalPhase;
  extra?: string;
  enqueuedAt: string;
}

function readQueue(db: Database): QueuedGoal[] {
  const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(REVENUE_KV.goalQueue) as { value: string } | undefined;
  if (!row?.value) return [];
  try {
    const parsed = JSON.parse(row.value);
    return Array.isArray(parsed) ? parsed.filter((q) => q && typeof q.lineId === "string" && typeof q.phase === "string") : [];
  } catch {
    return [];
  }
}

function writeQueue(db: Database, queue: QueuedGoal[]): void {
  db.prepare("INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))")
    .run(REVENUE_KV.goalQueue, JSON.stringify(queue));
}

export function listQueuedGoals(db: Database): QueuedGoal[] {
  return readQueue(db);
}

/** Enqueue; returns false if the same (line, phase) is already queued. */
export function enqueueGoal(db: Database, item: { lineId: string; phase: GoalPhase; extra?: string }): boolean {
  const queue = readQueue(db);
  if (queue.some((q) => q.lineId === item.lineId && q.phase === item.phase)) return false;
  if (goalIdForLine(db, item.lineId)) {
    // A goal for this line is already active in the orchestrator.
    const active = getActiveGoals(db).some((g) => g.id === goalIdForLine(db, item.lineId));
    if (active) return false;
  }
  queue.push({ ...item, enqueuedAt: new Date().toISOString() });
  writeQueue(db, queue);
  return true;
}

export function removeQueuedGoals(db: Database, lineId: string): number {
  const queue = readQueue(db);
  const kept = queue.filter((q) => q.lineId !== lineId);
  writeQueue(db, kept);
  return queue.length - kept.length;
}

export function goalIdForLine(db: Database, lineId: string): string | undefined {
  const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(`revenue.goal_for_line.${lineId}`) as { value: string } | undefined;
  return row?.value || undefined;
}

function setGoalForLine(db: Database, lineId: string, goalId: string): void {
  db.prepare("INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))")
    .run(`revenue.goal_for_line.${lineId}`, goalId);
}

export function hasGoalsTable(db: Database): boolean {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='goals'").get() as { name: string } | undefined;
  return Boolean(row);
}

/**
 * If the orchestrator is idle, pop the next queued goal and file it.
 * Returns the created goal id, or null when nothing was filed.
 */
export function feedNextGoal(db: Database): { goalId: string; lineId: string; phase: GoalPhase } | null {
  if (!hasGoalsTable(db)) return null;
  if (getActiveGoals(db).length > 0) return null;

  const queue = readQueue(db);
  while (queue.length > 0) {
    const next = queue.shift()!;
    const line = getLine(db, next.lineId);
    if (!line || line.status === "killed" || line.status === "paused") continue;
    if (line.status === "awaiting_setup" && !line.humanSetupDone) continue;

    const spec = buildGoalSpec(line, next.phase, next.extra);
    const goal = createGoal(db, spec.title, spec.description, spec.strategy);
    setGoalForLine(db, line.id, goal.id);
    if (line.status === "proposed" || line.status === "awaiting_setup") {
      updateLineStatus(db, line.id, "building");
    }
    writeQueue(db, queue);
    return { goalId: goal.id, lineId: line.id, phase: next.phase };
  }
  writeQueue(db, queue);
  return null;
}

/** Status of the goal most recently filed for a line, if any. */
export function lineGoalStatus(db: Database, lineId: string): { goalId: string; status: string } | null {
  const goalId = goalIdForLine(db, lineId);
  if (!goalId || !hasGoalsTable(db)) return null;
  const row = db.prepare("SELECT status FROM goals WHERE id = ?").get(goalId) as { status: string } | undefined;
  return row ? { goalId, status: row.status } : null;
}
