import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// server.test.ts drives buildServer() in memory. These tests drive what a user
// actually runs: the compiled dist/server.js, launched as a child process and
// spoken to over stdio, the way npx plus Claude Desktop or Cursor do it.
const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const entry = join(pkgRoot, "dist", "server.js");
let tmp: string;

beforeAll(() => {
  execFileSync(process.execPath, [join(pkgRoot, "node_modules", "typescript", "bin", "tsc"), "-p", pkgRoot]);
  tmp = mkdtempSync(join(tmpdir(), "mcp-il-tools-"));
}, 120_000);

afterAll(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
});

/** Launch `script` as an MCP client would. Resolves once `initialize` is answered. */
async function launch(script: string, env: Record<string, string> = {}): Promise<Client> {
  const client = new Client({ name: "test", version: "0" });
  const transport = new StdioClientTransport({ command: process.execPath, args: [script], env, stderr: "pipe" });
  await client.connect(transport, { timeout: 10_000 });
  return client;
}

describe("the start guard", () => {
  it("answers initialize when launched through a symlink, as npx and node_modules/.bin do", async () => {
    const link = join(tmp, "mcp-il-tools");
    symlinkSync(entry, link);
    const client = await launch(link);
    expect(client.getServerVersion()?.name).toBe("il-tools");
    await client.close();
  }, 20_000);

  it("still answers when launched by its real path (node dist/server.js)", async () => {
    const client = await launch(entry);
    expect(client.getServerVersion()?.name).toBe("il-tools");
    await client.close();
  }, 20_000);

  it("does not start a server when the module is only imported", () => {
    const importer = join(tmp, "importer.mjs");
    writeFileSync(importer, `import ${JSON.stringify(pathToFileURL(entry).href)};\n`);
    const initialize = JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } },
    });
    const run = spawnSync(process.execPath, [importer], { input: `${initialize}\n`, encoding: "utf8", timeout: 10_000 });
    expect(run.status).toBe(0);
    expect(run.stdout).toBe("");
  }, 20_000);
});

describe("hebrew_date is the same day in every timezone", () => {
  // 2026-09-12 is Rosh Hashanah, 1 Tishrei 5787. The pair is checked against
  // ICU's Hebrew calendar, an implementation independent of @hebcal/core.
  it("uses a fixture an independent calendar agrees with", () => {
    const icu = new Intl.DateTimeFormat("en-u-ca-hebrew", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });
    expect(icu.format(new Date(Date.UTC(2026, 8, 12)))).toBe("1 Tishri 5787");
  });

  // West of UTC (Los Angeles, Honolulu) is where the day used to slip back.
  it.each(["UTC", "America/Los_Angeles", "Pacific/Honolulu", "Asia/Jerusalem", "Pacific/Kiritimati"])(
    "under TZ=%s, 2026-09-12 is 1 Tishrei 5787",
    async (tz) => {
      const client = await launch(entry, { TZ: tz });
      const res = await client.callTool({ name: "hebrew_date", arguments: { date: "2026-09-12" } });
      await client.close();
      const r = JSON.parse((res.content as { type: string; text: string }[])[0].text);
      expect({ year: r.year, month: r.month, day: r.day }).toEqual({ year: 5787, month: "Tishrei", day: 1 });
    },
    20_000,
  );
});
