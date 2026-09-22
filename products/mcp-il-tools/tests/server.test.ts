import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { buildServer } from "../src/server.js";

// Drive the server the way a real client does, over a linked transport pair,
// rather than asserting on internals. If the registration shape is wrong, this
// fails the same way Claude Desktop or Cursor would.
let client: Client;

beforeAll(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "test", version: "0" });
  await Promise.all([buildServer().connect(serverTransport), client.connect(clientTransport)]);
});

afterAll(async () => { await client.close(); });

const call = async (name: string, args: Record<string, unknown>) => {
  const res = await client.callTool({ name, arguments: args });
  const first = (res.content as { type: string; text: string }[])[0];
  return JSON.parse(first.text);
};

describe("the server a client actually sees", () => {
  it("advertises exactly the five tools, each with a description and a schema", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "hebrew_date", "transliterate_hebrew", "validate_israeli_bank",
      "validate_israeli_id", "validate_israeli_phone",
    ]);
    for (const t of tools) {
      expect(t.description, `${t.name} needs a description a model can route on`).toBeTruthy();
      expect(t.description!.length).toBeGreaterThan(40);
      expect(t.inputSchema).toBeTruthy();
    }
  });

  it("validates a real ID and rejects a wrong check digit", async () => {
    const ok = await call("validate_israeli_id", { id: "000000018" });
    expect(ok.valid).toBe(true);
    expect(ok.normalized).toBe("000000018");
    const bad = await call("validate_israeli_id", { id: "000000019" });
    expect(bad.valid).toBe(false);
    expect(bad.reason).toBeTruthy();
  });

  it("pads a short ID, which is the step implementations get wrong", async () => {
    const r = await call("validate_israeli_id", { id: "18" });
    expect(r.normalized).toBe("000000018");
    expect(r.valid).toBe(true);
  });

  it("classifies a mobile and a toll-free number differently", async () => {
    const mobile = await call("validate_israeli_phone", { phone: "052-1234567" });
    expect(mobile.valid).toBe(true);
    expect(mobile.type).toBe("mobile");
    expect(mobile.e164).toBe("+972521234567");
    const tollFree = await call("validate_israeli_phone", { phone: "1-800-123-456" });
    expect(tollFree.type).toBe("toll_free");
    expect(tollFree.e164).toBeUndefined();
    const premium = await call("validate_israeli_phone", { phone: "1-900-123-456" });
    expect(premium.type).toBe("premium");
  });

  it("names the bank behind a bank code", async () => {
    const r = await call("validate_israeli_bank", { bank: 12, branch: 100, account: 123456 });
    expect(r.bankName).toBe("Bank Hapoalim");
    expect(r.valid).toBe(true);
  });

  it("converts a date to the Hebrew calendar", async () => {
    const r = await call("hebrew_date", { date: "2026-09-03" });
    expect(r.year).toBeGreaterThan(5780);
    expect(r.hebrew).toBeTruthy();
    expect(r.hebrewLatin).toBeTruthy();
    expect(typeof r.isLeapYear).toBe("boolean");
  });

  it("returns an error object instead of throwing on a bad date", async () => {
    const r = await call("hebrew_date", { date: "not-a-date" });
    expect(r.error).toBe("bad_request");
  });

  it("transliterates, and admits the output is approximate", async () => {
    const r = await call("transliterate_hebrew", { text: "שלום" });
    expect(r.latin).toMatch(/[a-z]/i);
    expect(r.note).toContain("not a standard romanisation");
  });

  it("reports a wrong argument shape as a tool error, the way the protocol does", async () => {
    const res = await client.callTool({ name: "validate_israeli_id", arguments: { id: 12345 } });
    expect(res.isError).toBe(true);
  });
});

describe("the copied validators cannot drift", () => {
  it("is byte-identical to the x402 API's copy", () => {
    // This package must be self-contained to be publishable, so israeli.ts is a
    // copy rather than an import. A copy with no guard is a copy that diverges.
    const mine = readFileSync(new URL("../src/israeli.ts", import.meta.url), "utf8");
    const theirs = readFileSync(new URL("../../x402-il-api/src/israeli.ts", import.meta.url), "utf8");
    expect(mine).toBe(theirs);
  });
});
