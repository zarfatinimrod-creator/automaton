/**
 * Pure utilities sold by the bot. No I/O, fully unit-tested.
 */
import { HDate, months } from "@hebcal/core";

export interface IdResult {
  input: string;
  normalized: string | null;
  valid: boolean;
  reason?: string;
}

/** Israeli ID (תעודת זהות) checksum: 9 digits, weights 1,2,1,2,…, digit-sum of products, total % 10 === 0. */
export function validateIsraeliId(raw: string): IdResult {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 0 || digits.length > 9) {
    return { input: raw, normalized: null, valid: false, reason: "expected up to 9 digits" };
  }
  const id = digits.padStart(9, "0");
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    let n = Number(id[i]) * (i % 2 === 0 ? 1 : 2);
    if (n > 9) n -= 9;
    sum += n;
  }
  const valid = sum % 10 === 0;
  return { input: raw, normalized: id, valid, reason: valid ? undefined : "checksum failed" };
}

export interface PhoneResult {
  input: string;
  valid: boolean;
  type?: "mobile" | "landline" | "voip" | "premium";
  national?: string;
  e164?: string;
  reason?: string;
}

/** Israeli phone numbers: mobile 05X (10 digits), VoIP 07X (10), landline 0[2-4,8,9] (9), with or without +972. */
export function validateIsraeliPhone(raw: string): PhoneResult {
  let digits = (raw ?? "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+972")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("972")) digits = "0" + digits.slice(3);
  else if (digits.startsWith("00972")) digits = "0" + digits.slice(5);
  digits = digits.replace(/\D/g, "");
  if (!/^[01]/.test(digits)) return { input: raw, valid: false, reason: "must start with 0, 1 or +972" };

  let type: PhoneResult["type"] | undefined;
  if (/^05\d{8}$/.test(digits)) type = "mobile";
  else if (/^07\d{8}$/.test(digits)) type = "voip";
  else if (/^0[23489]\d{7}$/.test(digits)) type = "landline";
  else if (/^1(700|800|900)\d{6}$/.test(digits)) type = "premium";
  if (!type) return { input: raw, valid: false, reason: "unknown Israeli number format" };

  // Premium/service numbers (1-700/800/900) have no country-code form.
  if (type === "premium") {
    const national = `${digits.slice(0, 1)}-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
    return { input: raw, valid: true, type, national };
  }

  const national = type === "landline"
    ? `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`
    : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return { input: raw, valid: true, type, national, e164: `+972${digits.slice(1)}` };
}

export interface HebrewDateResult {
  gregorian: string;
  hebrew: string;
  hebrewLatin: string;
  year: number;
  monthName: string;
  day: number;
  isLeapYear: boolean;
}

const MONTH_HE: Record<string, string> = {
  Nisan: "ניסן", Iyyar: "אייר", Sivan: "סיון", Tamuz: "תמוז", Av: "אב", Elul: "אלול",
  Tishrei: "תשרי", Cheshvan: "חשון", Kislev: "כסלו", Tevet: "טבת", "Sh'vat": "שבט",
  Adar: "אדר", "Adar I": "אדר א׳", "Adar II": "אדר ב׳",
};

/** Gregorian (YYYY-MM-DD) → Hebrew date. Throws on an invalid date string. */
export function toHebrewDate(iso: string): HebrewDateResult {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((iso ?? "").trim());
  if (!m) throw new Error("date must be YYYY-MM-DD");
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) {
    throw new Error("invalid calendar date");
  }
  const hd = new HDate(date);
  const monthName = hd.getMonthName();
  return {
    gregorian: iso.trim(),
    hebrew: hd.renderGematriya(),
    hebrewLatin: hd.render("en"),
    year: hd.getFullYear(),
    monthName: MONTH_HE[monthName] ?? monthName,
    day: hd.getDate(),
    isLeapYear: HDate.isLeapYear(hd.getFullYear()),
  };
}

/** Hebrew date → Gregorian ISO. month accepts Hebrew or English names; year is the Hebrew year (e.g. 5786). */
export function fromHebrewDate(day: number, month: string, year: number): string {
  const englishName = Object.entries(MONTH_HE).find(([, he]) => he === month)?.[0] ?? month;
  const monthNum = HDate.monthFromName(englishName);
  if (!monthNum) throw new Error(`unknown Hebrew month: ${month}`);
  const hd = new HDate(day, monthNum, year);
  const g = hd.greg();
  return `${g.getFullYear()}-${String(g.getMonth() + 1).padStart(2, "0")}-${String(g.getDate()).padStart(2, "0")}`;
}

export const HEBREW_MONTHS = months;
