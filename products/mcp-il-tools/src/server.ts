#!/usr/bin/env node
/**
 * MCP server: Israeli data validation.
 *
 * Five tools an agent working with Israeli data needs and usually gets wrong:
 * the teudat-zehut check digit, phone number classification, bank and branch
 * validation, the Hebrew calendar, and Hebrew-to-Latin transliteration.
 *
 * This is the free tier and the top of the funnel. The same logic is sold
 * per-call over x402 in products/x402-il-api for agents that would rather pay
 * than run a server; that is stated in the README rather than nagged about
 * here, because a tool that advertises inside its own output is a worse tool.
 *
 * The validators are a byte-identical copy of the x402 API's src/israeli.ts —
 * this package has to be self-contained to be publishable, and a test asserts
 * the two files match so the copy cannot quietly drift.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  toHebrewDate,
  transliterate,
  validateIsraeliBank,
  validateIsraeliId,
  validateIsraeliPhone,
} from "./israeli.js";

/** Every tool returns JSON as text: callers are agents, not humans. */
const json = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] });

export function buildServer(): McpServer {
  const server = new McpServer(
    { name: "il-tools", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.registerTool(
    "validate_israeli_id",
    {
      title: "Validate an Israeli ID number",
      description:
        "Validate an Israeli teudat zehut (תעודת זהות). Checks the Luhn-style check digit and " +
        "pads to nine digits, which is the step most implementations get wrong. Returns the " +
        "normalized nine-digit form, whether it is valid, and why not when it is not.",
      inputSchema: { id: z.string().describe("ID number, with or without leading zeros or separators") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ id }) => json(validateIsraeliId(id)),
  );

  server.registerTool(
    "validate_israeli_phone",
    {
      title: "Validate and classify an Israeli phone number",
      description:
        "Validate an Israeli phone number and say what kind it is — mobile, landline, VoIP, " +
        "toll-free (1-800), national-rate (1-700) or premium (1-900) — with a national format " +
        "and an E.164 form where one exists.",
      inputSchema: { phone: z.string().describe("Phone number in any common Israeli format") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ phone }) => json(validateIsraeliPhone(phone)),
  );

  server.registerTool(
    "validate_israeli_bank",
    {
      title: "Validate an Israeli bank account",
      description:
        "Check an Israeli bank code, branch and account number, and return the bank's name. " +
        "Useful before writing a payout destination, where a typo costs a failed transfer.",
      inputSchema: {
        bank: z.union([z.string(), z.number()]).describe("Bank code, e.g. 12 for Hapoalim"),
        branch: z.union([z.string(), z.number()]).optional().describe("Branch number"),
        account: z.union([z.string(), z.number()]).optional().describe("Account number"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ bank, branch, account }) => json(validateIsraeliBank({ bank, branch, account })),
  );

  server.registerTool(
    "hebrew_date",
    {
      title: "Convert a Gregorian date to the Hebrew calendar",
      description:
        "Convert an ISO date to the Hebrew calendar: Hebrew year, month and day, the Hebrew " +
        "string form and a Latin transcription of it, plus whether it falls in a Hebrew leap year.",
      inputSchema: { date: z.string().describe("ISO date, e.g. 2026-09-03") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ date }) => {
      try {
        return json(toHebrewDate(date));
      } catch (error) {
        return json({ error: "bad_request", message: (error as Error).message });
      }
    },
  );

  server.registerTool(
    "transliterate_hebrew",
    {
      title: "Transliterate Hebrew text to Latin characters",
      description:
        "Rule-based Hebrew-to-Latin transliteration, for slugs, filenames and search keys. " +
        "Approximate by design and not a standard romanisation — the output says so.",
      inputSchema: { text: z.string().describe("Hebrew text") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ text }) => json({
      input: text,
      latin: transliterate(text),
      note: "Rule-based and approximate; not a standard romanisation.",
    }),
  );

  return server;
}

/** Only start a transport when run as a program, so tests can import freely. */
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const server = buildServer();
  await server.connect(new StdioServerTransport());
}
