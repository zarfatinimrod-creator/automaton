/**
 * Revenue Colony — chain of command
 *
 * Defines the levels of command, the mandate of each level, the role
 * definitions handed to the planner for directors/supervisors, and the goal
 * specifications that the board files for a revenue line.
 *
 * Every level has a mandate AND a "must never" list. The lists are what make
 * the hierarchy auditable: an auditor can check any decision against them.
 */

import type { CustomRoleDef } from "../orchestration/planner.js";
import { formatIls } from "./money.js";
import type {
  CommandLevel,
  LineDecision,
  PortfolioSummary,
  RevenueLine,
} from "./types.js";

export interface CommandNode {
  level: CommandLevel;
  title: string;
  reportsTo: CommandLevel | null;
  cadence: string;
  mandate: string[];
  mustNever: string[];
}

export const COMMAND_CHAIN: Record<CommandLevel, CommandNode> = {
  board: {
    level: "board",
    title: "Board (the parent automaton)",
    reportsTo: null,
    cadence: "daily review; immediately on escalation",
    mandate: [
      "Own the monthly target and the portfolio of revenue lines",
      "Launch, pause, scale and kill lines using the shared decision rules",
      "Allocate the compute budget across lines every review",
      "File one goal at a time to the orchestrator, from the goal queue",
      "Act on every auditor flag within one review cycle",
      "Report to the creator only facts backed by the ledger",
    ],
    mustNever: [
      "Count projected or promised money as revenue",
      "Keep a line alive past its kill criteria without a written rationale",
      "Run more experiments than the policy allows",
      "Do any one-time human setup (KYC, bank, identity) itself or pretend it was done",
    ],
  },
  director: {
    level: "director",
    title: "Director of a revenue line",
    reportsTo: "board",
    cadence: "continuous while the line has an active goal",
    mandate: [
      "Run the line's operating loop end to end: build, ship, list, price, monitor, iterate",
      "Record every sale, refund and cost in the ledger with an external id",
      "Snapshot the line's KPIs at least daily",
      "Escalate anything that needs a human (account creation, identity checks) as awaiting_setup",
      "Prefer shipping a smaller sellable thing today over a bigger thing next week",
    ],
    mustNever: [
      "Spam, scrape against terms of service, fake reviews, or misrepresent what the product is",
      "Create accounts in the creator's name or answer identity checks",
      "Spend beyond the monthly budget allocated to the line",
      "Mark a line live without a real payment path that works end to end",
    ],
  },
  supervisor: {
    level: "supervisor",
    title: "Supervisor of a director",
    reportsTo: "board",
    cadence: "every 6 hours",
    mandate: [
      "Recompute the line's metrics from the ledger, not from the director's report",
      "Apply the decision rules and file a review (hold/scale/pivot/kill/escalate)",
      "Verify KPI snapshots are fresh and that costs are being recorded",
      "Escalate to the board on kill, pivot or anything outside policy",
    ],
    mustNever: [
      "Change a line's status directly (only the board does)",
      "Accept numbers that are not in the ledger",
      "Skip a review because the director says everything is fine",
    ],
  },
  worker: {
    level: "worker",
    title: "Worker",
    reportsTo: "director",
    cadence: "per task",
    mandate: [
      "Execute one task from the plan to its success criteria",
      "Return artifacts and cost so the director can record them",
    ],
    mustNever: [
      "Act outside the task's scope or spend outside the task's estimate",
      "Touch payment accounts, wallets or credentials not granted to the task",
    ],
  },
  auditor: {
    level: "auditor",
    title: "Auditor of supervisors",
    reportsTo: "chief_auditor",
    cadence: "weekly",
    mandate: [
      "Sample supervisor reviews and re-derive each decision from the raw ledger",
      "Flag any review whose decision disagrees with the rules",
      "Check that killed lines stopped spending and that live lines have revenue events",
      "Escalate to the board when the flag rate exceeds 30%",
    ],
    mustNever: [
      "Edit reviews, ledger entries or line status",
      "Audit its own previous audits",
    ],
  },
  chief_auditor: {
    level: "chief_auditor",
    title: "Chief auditor (audits the auditors)",
    reportsTo: "board",
    cadence: "monthly",
    mandate: [
      "Verify that audits happened every week",
      "Verify that every flag was followed by a board review of that line",
      "Verify that the ledger has no duplicate external ids and no revenue on killed lines",
      "Report structural failures to the board and the creator",
    ],
    mustNever: [
      "Approve a period with missing audits",
      "Modify any record",
    ],
  },
};

export const CHAIN_ORDER: CommandLevel[] = ["board", "director", "supervisor", "worker", "auditor", "chief_auditor"];

const CONSTITUTION_REMINDER = [
  "Constitution applies at every level: never harm, earn your existence honestly, never deceive.",
  "No spam, scams, fake reviews, manipulation, gambling, adult content or ToS-violating bot farms.",
  "Only value that people or agents voluntarily pay for.",
].join(" ");

const HUMAN_SETUP_RULE = [
  "The creator does not want to be involved. If a step needs a human (opening an account in the",
  "creator's name, identity verification, bank details), do NOT attempt it and do NOT work around it.",
  "Instead call revenue_decide with decision=escalate and list the exact steps; the board will park the",
  "line in awaiting_setup until the creator confirms with revenue_setup_done.",
].join(" ");

export function directorRoleFor(line: RevenueLine): CustomRoleDef {
  const node = COMMAND_CHAIN.director;
  return {
    name: line.directorRole,
    description: `Director of the "${line.name}" revenue line (${line.category}, tier ${line.tier})`,
    systemPrompt: [
      `# ${node.title}: ${line.name}`,
      "",
      "<identity>",
      `You are the director of the revenue line "${line.name}" (id: ${line.id}). You report to the board.`,
      `Monthly target for this line: ${formatIls(line.targetMonthlyAgorot)}. Monthly compute budget: ${line.budgetMonthlyCents} credit cents.`,
      "</identity>",
      "",
      "<operating_loop>",
      line.operatingLoop,
      "</operating_loop>",
      "",
      "<kpis>",
      ...line.kpis.map((k) => `- ${k}`),
      "</kpis>",
      "",
      "<kill_criteria>",
      ...line.killCriteria.map((k) => `- ${k}`),
      "</kill_criteria>",
      "",
      "<scale_criteria>",
      ...line.scaleCriteria.map((k) => `- ${k}`),
      "</scale_criteria>",
      "",
      "<mandate>",
      ...node.mandate.map((m) => `- ${m}`),
      "</mandate>",
      "",
      "<must_never>",
      ...node.mustNever.map((m) => `- ${m}`),
      "</must_never>",
      "",
      "<reporting>",
      "- Record money with revenue_record (kind sale|subscription|refund|cost, amount in minor units, currency, source, externalId).",
      "- Record KPIs with revenue_kpi. Check your standing with revenue_line_detail.",
      `- ${HUMAN_SETUP_RULE}`,
      "</reporting>",
      "",
      CONSTITUTION_REMINDER,
    ].join("\n"),
    allowedTools: [
      "exec", "write_file", "read_file", "expose_port", "remove_port",
      "search_domains", "register_domain", "manage_dns", "x402_fetch",
      "install_npm_package", "git_status", "git_diff", "git_commit", "git_log",
      "remember_fact", "recall_facts", "save_procedure", "recall_procedure",
      "revenue_record", "revenue_kpi", "revenue_line_detail", "revenue_status", "revenue_decide", "revenue_map_product",
      "create_skill", "list_skills",
    ],
    deniedTools: ["transfer_credits", "spawn_child", "fund_child", "edit_own_file", "reset_to_upstream", "update_genesis_prompt"],
    model: "tier:reasoning",
    maxTurnsPerTask: 40,
    treasuryLimits: {
      maxSingleTransfer: 0,
      maxDailySpend: Math.max(100, Math.floor(line.budgetMonthlyCents / 30)),
    },
    rationale: `Dedicated director role so that the "${line.name}" line has a single accountable owner with a scoped tool set and budget.`,
  };
}

export function supervisorRoleFor(line: RevenueLine): CustomRoleDef {
  const node = COMMAND_CHAIN.supervisor;
  return {
    name: `supervisor-${line.id}`,
    description: `Supervisor of the "${line.name}" director; reviews KPIs and files decisions`,
    systemPrompt: [
      `# ${node.title}: ${line.name}`,
      "",
      `You supervise the director of "${line.name}" (id: ${line.id}). You do not build anything.`,
      "You read the ledger and KPI snapshots, apply the decision rules, and file a review.",
      "",
      "<mandate>",
      ...node.mandate.map((m) => `- ${m}`),
      "</mandate>",
      "",
      "<must_never>",
      ...node.mustNever.map((m) => `- ${m}`),
      "</must_never>",
      "",
      "Tools: revenue_line_detail (numbers), revenue_status (portfolio), revenue_decide with level=supervisor to file your review.",
      CONSTITUTION_REMINDER,
    ].join("\n"),
    allowedTools: ["revenue_line_detail", "revenue_status", "revenue_lines", "revenue_decide", "recall_facts", "remember_fact"],
    deniedTools: ["exec", "write_file", "transfer_credits", "spawn_child", "fund_child", "revenue_record"],
    model: "tier:fast",
    maxTurnsPerTask: 8,
    treasuryLimits: { maxSingleTransfer: 0, maxDailySpend: 50 },
    rationale: "Separation of duties: the reviewer must not be the builder and must not be able to edit the ledger.",
  };
}

export type GoalPhase = "build" | "grow" | "pivot" | "fix";

export function buildGoalSpec(
  line: RevenueLine,
  phase: GoalPhase,
  extra?: string,
): { title: string; description: string; strategy: string } {
  const phaseTitle: Record<GoalPhase, string> = {
    build: `Build and ship revenue line: ${line.name}`,
    grow: `Grow revenue line to target: ${line.name}`,
    pivot: `Pivot revenue line: ${line.name}`,
    fix: `Fix revenue line: ${line.name}`,
  };
  const phaseGoal: Record<GoalPhase, string> = {
    build: "Ship the smallest version that a stranger can pay for, end to end, and prove the payment path with a real test transaction where the platform allows one.",
    grow: "Increase paid conversions toward the monthly target by improving the offer, listing, pricing, and discovery — without paid ads unless the budget line explicitly allows it.",
    pivot: "Costs exceed revenue. Change the offer or channel while keeping what already sells; cut every recurring cost that does not map to a sale.",
    fix: "Revenue stalled or collapsed. Diagnose from the ledger and platform data, then repair the funnel or the product.",
  };

  const description = [
    `Revenue line id: ${line.id}. Category: ${line.category}. Tier: ${line.tier}. Director role: ${line.directorRole}.`,
    `Monthly target: ${formatIls(line.targetMonthlyAgorot)}. Monthly compute budget: ${line.budgetMonthlyCents} credit cents.`,
    "",
    `PHASE GOAL: ${phaseGoal[phase]}`,
    "",
    "OPERATING LOOP (the director's standing instructions):",
    line.operatingLoop,
    "",
    line.skillName
      ? `PLAYBOOK: read ~/.automaton/skills/${line.skillName}/SKILL.md with read_file before planning; it holds platform facts, pricing guidance and the do/don't list for this line.`
      : "",
    `KPIs: ${line.kpis.join(" | ")}`,
    `Kill criteria: ${line.killCriteria.join(" | ")}`,
    `Scale criteria: ${line.scaleCriteria.join(" | ")}`,
    "",
    "SUCCESS CRITERIA FOR THIS GOAL:",
    phase === "build"
      ? "1) A public URL or listing exists. 2) A price is set. 3) A payment path was exercised (test mode or a real ₪/$ transaction recorded via revenue_record with an external id). 4) KPI snapshots recorded via revenue_kpi. 5) A short runbook saved with save_procedure."
      : "1) Every change is measured: KPI snapshots before and after via revenue_kpi. 2) All costs recorded via revenue_record kind=cost. 3) A written summary of what moved the numbers saved with remember_fact.",
    "",
    HUMAN_SETUP_RULE,
    "",
    CONSTITUTION_REMINDER,
    extra ? `\nBOARD NOTE: ${extra}` : "",
  ].join("\n");

  return {
    title: phaseTitle[phase],
    description,
    strategy: `Assign the ${line.directorRole} role as the accountable owner; keep tasks small and testable; include a validate task after any deployment or listing; do not exceed the line budget.`,
  };
}

export function renderOrgChart(lines: RevenueLine[]): string {
  const active = lines.filter((l) => l.status !== "killed");
  const out: string[] = [];
  out.push("BOARD (parent automaton) — daily portfolio review, launch/kill/scale, budget allocation");
  out.push("├── CHIEF AUDITOR — monthly; audits the auditors");
  out.push("│   └── AUDITOR — weekly; re-derives every supervisor decision from the ledger");
  for (let i = 0; i < active.length; i += 1) {
    const l = active[i];
    const last = i === active.length - 1;
    const branch = last ? "└──" : "├──";
    const pad = last ? "    " : "│   ";
    out.push(`${branch} DIRECTOR ${l.directorRole} — ${l.name} [${l.tier}/${l.status}] target ${formatIls(l.targetMonthlyAgorot)}`);
    out.push(`${pad}├── SUPERVISOR supervisor-${l.id} — every 6h, files hold/scale/pivot/kill/escalate`);
    out.push(`${pad}└── WORKERS — per task from the planner`);
  }
  return out.join("\n");
}

export function renderBoardDirective(
  summary: PortfolioSummary,
  decisions: LineDecision[],
  actions: string[],
): string {
  const lines: string[] = [];
  lines.push(`Board review ${summary.asOf.slice(0, 16)}Z`);
  lines.push(
    `30d revenue ${formatIls(summary.total30dAgorot)} of target ${formatIls(summary.targetMonthlyAgorot)} (${(summary.attainment * 100).toFixed(1)}%); run-rate ${formatIls(summary.runRateMonthlyAgorot)}/mo; net ${formatIls(summary.net30dAgorot)}`,
  );
  const nonHold = decisions.filter((d) => d.decision !== "hold");
  if (nonHold.length) {
    lines.push("Decisions:");
    for (const d of nonHold) lines.push(`- ${d.lineId}: ${d.decision} — ${d.rationale}`);
  } else {
    lines.push("Decisions: all lines hold.");
  }
  if (actions.length) {
    lines.push("Actions taken:");
    for (const a of actions) lines.push(`- ${a}`);
  }
  return lines.join("\n");
}
