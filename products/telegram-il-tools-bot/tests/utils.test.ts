import { describe, it, expect } from "vitest";
import { fromHebrewDate, toHebrewDate, validateIsraeliId, validateIsraeliPhone } from "../src/utils.js";

describe("validateIsraeliId", () => {
  it("accepts a valid checksum and pads short ids", () => {
    expect(validateIsraeliId("000000018").valid).toBe(true);
    expect(validateIsraeliId("18").normalized).toBe("000000018");
    expect(validateIsraeliId("18").valid).toBe(true);
  });
  it("rejects a wrong checksum and garbage", () => {
    expect(validateIsraeliId("000000019").valid).toBe(false);
    expect(validateIsraeliId("abc").valid).toBe(false);
    expect(validateIsraeliId("1234567890").valid).toBe(false);
  });
});

describe("validateIsraeliPhone", () => {
  it("normalises mobile numbers to E.164", () => {
    const r = validateIsraeliPhone("050-123-4567");
    expect(r.valid).toBe(true);
    expect(r.type).toBe("mobile");
    expect(r.e164).toBe("+972501234567");
    expect(validateIsraeliPhone("+972 50 123 4567").e164).toBe("+972501234567");
  });
  it("recognises landlines, voip and premium numbers", () => {
    expect(validateIsraeliPhone("03-1234567").type).toBe("landline");
    expect(validateIsraeliPhone("0771234567").type).toBe("voip");
    expect(validateIsraeliPhone("1800123456").type).toBe("premium");
  });
  it("rejects non-Israeli formats", () => {
    expect(validateIsraeliPhone("12345").valid).toBe(false);
    expect(validateIsraeliPhone("+1 415 555 0000").valid).toBe(false);
  });
});

describe("hebrew dates", () => {
  it("converts Rosh Hashana 5786 both ways", () => {
    const r = toHebrewDate("2025-09-23");
    expect(r.year).toBe(5786);
    expect(r.monthName).toBe("תשרי");
    expect(r.day).toBe(1);
    expect(fromHebrewDate(1, "תשרי", 5786)).toBe("2025-09-23");
  });
  it("rejects invalid input", () => {
    expect(() => toHebrewDate("2026-02-30")).toThrow();
    expect(() => toHebrewDate("nope")).toThrow();
    expect(() => fromHebrewDate(1, "Nonsense", 5786)).toThrow();
  });
});
