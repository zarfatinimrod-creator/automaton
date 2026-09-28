/**
 * The four brand-mailbox questions (research/owner-asks/) live in ONE machine-readable file, questions.json, which
 * scripts/brand_mail.py sends from. The research note brand-mailbox-questions.md keeps the rationale and quotes the
 * same messages so a reader sees them in context. These tests pin the two together, and pin what every message must
 * and must not say: the operator disclosure (research/breadth/BOARD.md Q2), the brand signature, and no personal
 * name, phone number, postal address or email address (MISSION, anonymous publishing; PUBLISH-9).
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "../../..");
const askDir = path.join(repoRoot, "research", "owner-asks");
const md = fs.readFileSync(path.join(askDir, "brand-mailbox-questions.md"), "utf-8");

interface HeldQuestion {
  text: string;
  to: string | null;
  when: string;
}
interface Venue {
  venue: string;
  name: string;
  order: number;
  to: string | null;
  route: string;
  subject: string;
  body: string;
  preSend: string;
  heldQuestions: HeldQuestion[];
  followUpAfterDays: number;
}
interface Questions {
  signature: string;
  disclosure: string[];
  venues: Venue[];
}

const readQuestions = (): Questions => JSON.parse(fs.readFileSync(path.join(askDir, "questions.json"), "utf-8"));

/** Paragraphs with their inner whitespace collapsed: the md hard-wraps at ~120 columns, the JSON does not. */
const paragraphs = (text: string): string[] =>
  text
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim());

interface MdSection {
  heading: string;
  subject: string | null;
  body: string | null;
  recipient: string | null;
}

/** The numbered venue sections of the md: "## 1. CrazyGames (...)" up to the next "## ". */
function mdSections(): MdSection[] {
  const parts = md.split(/^## /m).slice(1);
  return parts
    .filter((p) => /^\d+\. /.test(p))
    .map((p) => {
      const heading = p.split("\n")[0];
      const subject = p.match(/^- \*\*Subject:\*\* (.+)$/m)?.[1]?.trim() ?? null;
      const body = p.match(/```text\n([\s\S]*?)\n```/)?.[1] ?? null;
      const recipientLine = p.match(/^- \*\*Recipient:\*\* (.+)$/m)?.[1] ?? null;
      const recipient = recipientLine?.match(/`([^`\s]+@[^`\s]+)`/)?.[1] ?? null;
      return { heading, subject, body, recipient };
    });
}

describe("research/owner-asks/questions.json is the single source the sender reads", () => {
  it("exists, and the research note points to it", () => {
    const q = readQuestions();
    expect(q.venues.map((v) => v.venue)).toEqual(["crazygames", "wix", "spreadshirt", "n8n"]);
    expect(q.venues.map((v) => v.order)).toEqual([1, 2, 3, 4]);
    expect(md).toMatch(/research\/owner-asks\/questions\.json/);
    expect(md).toMatch(/scripts\/brand_mail\.py/);
  });

  it("agrees with every message the note quotes: subject, body and recipient", () => {
    const q = readQuestions();
    const sections = mdSections();
    expect(sections).toHaveLength(q.venues.length);
    sections.forEach((s, i) => {
      const v = q.venues[i];
      expect(s.heading, `section ${i + 1}`).toContain(v.name);
      expect(s.subject, `${v.venue} subject`).toBe(v.subject);
      expect(s.body, `${v.venue} body is quoted in the note`).not.toBeNull();
      expect(paragraphs(s.body!), `${v.venue} body`).toEqual(paragraphs(v.body));
      // An email address is sent to only when the note's Recipient line names it; a form route has none.
      expect(v.to, `${v.venue} recipient`).toBe(s.recipient);
    });
  });

  it("keeps each held question's address in the note too, and never sends a held question by default", () => {
    const q = readQuestions();
    for (const v of q.venues) {
      for (const h of v.heldQuestions) {
        if (h.to) expect(md, `${v.venue} held address`).toContain(`\`${h.to}\``);
        expect(h.when).toMatch(/after a (written )?yes/i);
      }
    }
    expect(q.venues.find((v) => v.venue === "spreadshirt")!.heldQuestions).toHaveLength(2);
  });

  it("allows one follow-up no sooner than seven days after the first send, as the note's rule says", () => {
    expect(md).toMatch(/never sooner than 7 days after the first send, at most once/);
    for (const v of readQuestions().venues) expect(v.followUpAfterDays, v.venue).toBe(7);
  });

  it("names a route for every venue, and an address only where a capture holds one", () => {
    const q = readQuestions();
    for (const v of q.venues) expect(v.route.length, v.venue).toBeGreaterThan(20);
    expect(q.venues.filter((v) => v.to).map((v) => v.venue)).toEqual(["crazygames", "wix"]);
  });
});

describe("what every message says, and what none may say", () => {
  const q = readQuestions();

  it("discloses the automated operator in every body (research/breadth/BOARD.md Q2)", () => {
    expect(q.disclosure.length).toBeGreaterThanOrEqual(2);
    for (const v of q.venues) {
      for (const phrase of q.disclosure) expect(v.body, `${v.venue}: "${phrase}"`).toContain(phrase);
      expect(v.body, v.venue).toMatch(/AI agent/);
    }
  });

  it("is signed by the brand and nobody else", () => {
    expect(q.signature).toBe("Mehudak (מהודק)");
    for (const v of q.venues) {
      expect(v.body.startsWith("Hello "), v.venue).toBe(true);
      expect(v.body.trimEnd().endsWith(`Thank you,\n${q.signature}`), v.venue).toBe(true);
    }
  });

  it("asks one yes/no question and asks for nothing binding", () => {
    for (const v of q.venues) {
      expect(v.body, v.venue).toMatch(/One question, yes or no:/);
      expect(v.body, v.venue).toMatch(/We are asking for your current rule only, not for an exception or a commitment\./);
    }
  });

  it("carries no email address, phone number or postal address in any subject, body or held question", () => {
    const texts = q.venues.flatMap((v) => [v.subject, v.body, ...v.heldQuestions.map((h) => h.text)]);
    for (const t of texts) {
      expect(t, t).not.toMatch(/@/);
      expect(t, t).not.toMatch(/\+?\d[\d ().-]{6,}\d/);
      expect(t, t).not.toMatch(/\b(street|st\.|road|rd\.|avenue|ave\.|p\.?\s?o\.?\s?box|suite|apt\.?)\b/i);
      expect(t, t).not.toMatch(/רחוב|ת\.ד|שדרות|דירה/);
      expect(t, t).not.toMatch(/https?:\/\//);
    }
  });

  it("carries no personal name: every capitalised word and every Hebrew word is on a reviewed list", () => {
    // A name can only enter by being added here, in a reviewed diff. The list is the vocabulary of the four
    // messages as written on 28.9.2026: sentence starts, the brand, the venues, and the products they name.
    const allowed = new Set([
      "A", "AI", "API", "Agreement", "App", "Before", "CLI", "CrazyGames", "Developer", "Developers", "EU", "Hello",
      "HTML5", "If", "Israel", "Its", "June", "Market", "Marketplace", "Mehudak", "Must", "OWASP", "One", "Partner",
      "PayPal", "Portal", "Question", "Questions", "Spreadshirt", "Spreadshop", "Thank", "Tipalti", "We", "Wix", "ZAP",
      "Can", "Is", "It",
    ]);
    const hebrewAllowed = new Set(["מהודק"]);
    const texts = q.venues.flatMap((v) => [v.subject, v.body, ...v.heldQuestions.map((h) => h.text)]);
    const unknown = new Set<string>();
    for (const t of texts) {
      for (const w of t.match(/\b[A-Z][A-Za-z0-9]*\b/g) ?? []) if (!allowed.has(w)) unknown.add(w);
      for (const w of t.match(/[֐-׿]+/g) ?? []) if (!hebrewAllowed.has(w)) unknown.add(w);
    }
    expect([...unknown]).toEqual([]);
  });
});

describe("research/owner-asks/sent.json — the record of what was sent", () => {
  it("is valid, and every record names a known venue, a kind, a time, a Message-ID and the recipient", () => {
    const sent = JSON.parse(fs.readFileSync(path.join(askDir, "sent.json"), "utf-8"));
    expect(Array.isArray(sent.sent)).toBe(true);
    expect(Array.isArray(sent.repliesRecorded)).toBe(true);
    const venues = new Set(readQuestions().venues.map((v) => v.venue));
    for (const r of sent.sent) {
      expect(venues.has(r.venue)).toBe(true);
      expect(["first", "follow-up"]).toContain(r.kind);
      expect(["sent", "uncertain"]).toContain(r.status);
      expect(Number.isNaN(Date.parse(r.sentAt))).toBe(false);
      expect(r.messageId).toMatch(/^<[^<>\s]+@[^<>\s]+>$/);
      expect(typeof r.subject).toBe("string");
      expect(typeof r.to).toBe("string");
    }
    for (const r of sent.repliesRecorded) {
      expect(venues.has(r.venue)).toBe(true);
      expect(["YES", "NO", "NOT ANSWERED"]).toContain(r.reading);
      // The follow-up guard compares messages, not counts: a reading lists the Message-ID of every message it covers.
      expect(Array.isArray(r.coveredMessageIds)).toBe(true);
      for (const id of r.coveredMessageIds) expect(id).toMatch(/^<[^<>\s]+>$/);
      expect(r).not.toHaveProperty("inReplyCount");
    }
  });

  it("is described as the record, not as empty — it stops being empty at the first send", () => {
    expect(md).not.toMatch(/Nothing here has been sent|sent\.json` is empty/);
    expect(md).toMatch(/`research\/owner-asks\/sent\.json` is the record of what was sent/);
  });
});

describe("the reading words the note, the sender and sent.json use are the same three", () => {
  it("never tells anyone to record UNANSWERED, a reading sent.json does not accept", () => {
    const script = fs.readFileSync(path.join(repoRoot, "scripts", "brand_mail.py"), "utf-8");
    for (const [name, text] of [["note", md], ["brand_mail.py", script]] as const) {
      expect(text.replace(/NOT ANSWERED/g, ""), name).not.toMatch(/UNANSWERED/);
    }
    expect(md).toMatch(/record NOT ANSWERED/);
  });
});
