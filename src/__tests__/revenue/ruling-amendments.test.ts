import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * A ruling that amends an earlier one writes the amendment text once, and the fold copies it under the amended ruling.
 * The copy is the 29.9 record's only statement of what changed, so it must stay the ruling's text byte for byte: a
 * changed amount or flag in the copy (review R3: "amount 10, `prevent_further_usage` false") would amend the 29.9 ruling
 * with words no sitting wrote, and nothing else in the suite reads the copy.
 *
 * Ruling 4.10 on FABLE_QUEUE row 18 (research/channel-loop/RULING-2026-10-04-mozilla-precondition.md, "Amendment text
 * for RULING-2026-09-29-loop.md (b)"; fold action 1): the block is appended under (b)'s "Tick 18+" item, indented two
 * spaces as that item's continuation.
 */
const RULING = "research/channel-loop/RULING-2026-10-04-mozilla-precondition.md";
const AMENDED = "research/channel-loop/RULING-2026-09-29-loop.md";
const HEADING = "## Amendment text for RULING-2026-09-29-loop.md (b)";

describe("ruling 4.10's amendment stands verbatim under ruling (b) of 29.9", () => {
  const ruling = readFileSync(RULING, "utf8").split("\n");
  const start = ruling.indexOf(HEADING);
  const end = ruling.findIndex((l, i) => i > start && l.startsWith("## "));
  const body = ruling.slice(start + 1, end);
  const block = body.filter((l) => l.startsWith(">"));

  it("finds one contiguous quoted block under the ruling's amendment heading", () => {
    expect(start).toBeGreaterThan(0);
    expect(end).toBeGreaterThan(start);
    expect(block.length).toBeGreaterThanOrEqual(19);
    expect(block[0]).toMatch(/^> \*\*Amended 4\.10\.2026 \(`RULING-2026-10-04-mozilla-precondition\.md`, FABLE_QUEUE row 18\)\.\*\*/);
    // Only blank lines around it: the block is the whole of the section's text.
    expect(body.filter((l) => !l.startsWith(">")).every((l) => l.trim() === "")).toBe(true);
    const first = body.findIndex((l) => l.startsWith(">"));
    expect(body.slice(first, first + block.length)).toEqual(block);
  });

  it("carries every line of it, in order and contiguous, two spaces in, right after the Tick 18+ item it amends", () => {
    const amended = readFileSync(AMENDED, "utf8").split("\n");
    const at = amended.indexOf(`  ${block[0]}`);
    expect(at).toBeGreaterThan(0);
    expect(amended.slice(at, at + block.length)).toEqual(block.map((l) => `  ${l}`));
    expect(amended[at - 1]).toBe(
      "  BBU. If the free allowance cannot hold a meaningful run, the tick records that and does not extend it.",
    );
    // The amended text stays as history above the note.
    expect(amended.slice(0, at).join("\n")).toContain(
      "Mozilla's dry-run harness, only after a runner has read the\n  account's Actions spending limit as $0",
    );
  });
});
