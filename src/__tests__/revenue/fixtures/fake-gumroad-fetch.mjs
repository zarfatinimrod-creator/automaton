// Test-only preload for colony-cli.test.ts (`node --import tsx --import <this file> scripts/colony.ts verify-gumroad`):
// replaces globalThis.fetch with a fake Gumroad sales index, so the CLI's verify-gumroad runs end to end with no network.
// FAKE_GUMROAD_SALES names a JSON file holding the sales array (answered in pages of ten, with next_page_key);
// FAKE_GUMROAD_LOG names a file that gets one line per request, so a test can prove that no request was made.
// Every id and token a test passes here is invented (RULING-2026-10-11-ledger-sale-ids.md, fold 7).
import fs from "node:fs";

globalThis.fetch = async (url) => {
  const log = process.env.FAKE_GUMROAD_LOG;
  if (log) fs.appendFileSync(log, "request\n");
  const file = process.env.FAKE_GUMROAD_SALES;
  const sales = file ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
  const start = Number(new URL(String(url)).searchParams.get("page_key") ?? 0);
  const body = { success: true, sales: sales.slice(start, start + 10) };
  if (start + 10 < sales.length) body.next_page_key = String(start + 10);
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
};
