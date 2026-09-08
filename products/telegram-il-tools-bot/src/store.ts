/**
 * Tiny persistence: per-user usage counters and pro passes, plus a payments
 * log the automaton's ledger sync can import (one JSON object per line).
 */
import fs from "node:fs";

export interface UserState {
  dayKey: string;
  usedToday: number;
  proUntil: number | null; // epoch ms
  credits: number; // prepaid single uses
}

export interface PaymentRecord {
  at: string;
  userId: number;
  stars: number;
  payload: string;
  telegramChargeId: string;
  note: string;
}

export class Store {
  private users = new Map<number, UserState>();

  constructor(private readonly stateFile?: string, private readonly paymentsLog?: string) {
    if (stateFile && fs.existsSync(stateFile)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(stateFile, "utf-8")) as Record<string, UserState>;
        for (const [k, v] of Object.entries(parsed)) this.users.set(Number(k), v);
      } catch {
        // corrupt state file: start fresh, never crash the bot
      }
    }
  }

  get(userId: number, now = Date.now()): UserState {
    const dayKey = new Date(now).toISOString().slice(0, 10);
    const existing = this.users.get(userId);
    if (!existing) {
      const fresh: UserState = { dayKey, usedToday: 0, proUntil: null, credits: 0 };
      this.users.set(userId, fresh);
      return fresh;
    }
    if (existing.dayKey !== dayKey) {
      existing.dayKey = dayKey;
      existing.usedToday = 0;
    }
    return existing;
  }

  isPro(userId: number, now = Date.now()): boolean {
    const u = this.get(userId, now);
    return u.proUntil !== null && u.proUntil > now;
  }

  /** Returns true if the user may run one paid action now (and consumes the allowance). */
  consume(userId: number, freeDaily: number, now = Date.now()): { allowed: boolean; reason: "pro" | "free" | "credit" | "blocked" } {
    const u = this.get(userId, now);
    if (this.isPro(userId, now)) return { allowed: true, reason: "pro" };
    if (u.usedToday < freeDaily) {
      u.usedToday += 1;
      this.persist();
      return { allowed: true, reason: "free" };
    }
    if (u.credits > 0) {
      u.credits -= 1;
      this.persist();
      return { allowed: true, reason: "credit" };
    }
    return { allowed: false, reason: "blocked" };
  }

  grantPro(userId: number, days: number, now = Date.now()): void {
    const u = this.get(userId, now);
    const base = u.proUntil && u.proUntil > now ? u.proUntil : now;
    u.proUntil = base + days * 86_400_000;
    this.persist();
  }

  grantCredits(userId: number, n: number): void {
    const u = this.get(userId);
    u.credits += n;
    this.persist();
  }

  recordPayment(p: PaymentRecord): void {
    if (!this.paymentsLog) return;
    fs.appendFileSync(this.paymentsLog, JSON.stringify(p) + "\n");
  }

  private persist(): void {
    if (!this.stateFile) return;
    const obj: Record<string, UserState> = {};
    for (const [k, v] of this.users) obj[String(k)] = v;
    fs.writeFileSync(this.stateFile, JSON.stringify(obj));
  }
}
