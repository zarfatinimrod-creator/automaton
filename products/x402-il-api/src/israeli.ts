/**
 * Pure Israeli-format validators. Format and checksum only: these never claim
 * that a person, line or account actually exists.
 */
import { HDate } from "@hebcal/core";

export interface IdResult { input: string; normalized: string | null; valid: boolean; reason?: string }

export function validateIsraeliId(raw: unknown): IdResult {
  const input = typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
  const digits = input.replace(/\D/g, "");
  if (digits.length === 0 || digits.length > 9) {
    return { input, normalized: null, valid: false, reason: "expected 1-9 digits" };
  }
  const id = digits.padStart(9, "0");
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    let n = Number(id[i]) * (i % 2 === 0 ? 1 : 2);
    if (n > 9) n -= 9;
    sum += n;
  }
  const valid = sum % 10 === 0;
  return { input, normalized: id, valid, reason: valid ? undefined : "checksum failed" };
}

export interface PhoneResult {
  input: string; valid: boolean; type?: "mobile" | "landline" | "voip" | "premium";
  national?: string; e164?: string; reason?: string;
}

export function validateIsraeliPhone(raw: unknown): PhoneResult {
  const input = typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
  let digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+972")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("00972")) digits = "0" + digits.slice(5);
  else if (digits.startsWith("972") && digits.length >= 11) digits = "0" + digits.slice(3);
  digits = digits.replace(/\D/g, "");
  if (!/^[01]/.test(digits)) return { input, valid: false, reason: "must start with 0, 1 or +972" };

  let type: PhoneResult["type"] | undefined;
  if (/^05\d{8}$/.test(digits)) type = "mobile";
  else if (/^07\d{8}$/.test(digits)) type = "voip";
  else if (/^0[23489]\d{7}$/.test(digits)) type = "landline";
  else if (/^1(700|800|900)\d{6}$/.test(digits)) type = "premium";
  if (!type) return { input, valid: false, reason: "unknown Israeli number format" };

  if (type === "premium") {
    return { input, valid: true, type, national: `${digits.slice(0, 1)}-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}` };
  }
  const national = type === "landline"
    ? `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`
    : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return { input, valid: true, type, national, e164: `+972${digits.slice(1)}` };
}

/** Bank codes are the Bank of Israel institution codes; this list covers the major banks. */
export const ISRAELI_BANKS: Record<string, string> = {
  "4": "Bank Yahav",
  "9": "Israel Postal Bank",
  "10": "Bank Leumi",
  "11": "Discount Bank",
  "12": "Bank Hapoalim",
  "13": "Igud Bank",
  "14": "Bank Otsar Ha-Hayal",
  "17": "Mercantile Discount Bank",
  "20": "Mizrahi Tefahot",
  "22": "Citibank Israel",
  "23": "HSBC Israel",
  "26": "UBank",
  "31": "Bank Beinleumi",
  "34": "Bank Arab Israeli",
  "46": "Bank Massad",
  "52": "Bank Poalei Agudat Israel",
  "54": "Jerusalem Bank",
  "68": "Bank Dexia Israel",
};

export interface BankResult {
  valid: boolean; bankCode?: string; bankName?: string; branch?: string; account?: string; reason?: string;
  note: string;
}

const BANK_NOTE = "Format check only: this does not verify that the account exists or belongs to anyone.";

export function validateIsraeliBank(input: { bank?: unknown; branch?: unknown; account?: unknown }): BankResult {
  const bank = String(input.bank ?? "").replace(/\D/g, "");
  const branch = String(input.branch ?? "").replace(/\D/g, "");
  const account = String(input.account ?? "").replace(/\D/g, "");
  if (!bank || !branch || !account) return { valid: false, reason: "bank, branch and account are all required", note: BANK_NOTE };
  const bankKey = String(Number(bank));
  const bankName = ISRAELI_BANKS[bankKey];
  if (!bankName) return { valid: false, bankCode: bankKey, reason: `unknown Israeli bank code ${bankKey}`, note: BANK_NOTE };
  if (branch.length < 1 || branch.length > 3) return { valid: false, bankCode: bankKey, bankName, reason: "branch must be 1-3 digits", note: BANK_NOTE };
  if (account.length < 4 || account.length > 9) return { valid: false, bankCode: bankKey, bankName, reason: "account must be 4-9 digits", note: BANK_NOTE };
  return { valid: true, bankCode: bankKey, bankName, branch: branch.padStart(3, "0"), account, note: BANK_NOTE };
}

export interface HebrewDateResult {
  gregorian: string; hebrew: string; hebrewLatin: string;
  year: number; month: string; day: number; isLeapYear: boolean;
}

export function toHebrewDate(iso: string): HebrewDateResult {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((iso ?? "").trim());
  if (!m) throw new Error("date must be YYYY-MM-DD");
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) {
    throw new Error("invalid calendar date");
  }
  const hd = new HDate(date);
  return {
    gregorian: m[0], hebrew: hd.renderGematriya(), hebrewLatin: hd.render("en"),
    year: hd.getFullYear(), month: hd.getMonthName(), day: hd.getDate(),
    isLeapYear: HDate.isLeapYear(hd.getFullYear()),
  };
}

const TRANSLIT: Record<string, string> = {
  "א": "'", "ב": "v", "ג": "g", "ד": "d", "ה": "h", "ו": "v", "ז": "z", "ח": "ch", "ט": "t",
  "י": "y", "כ": "kh", "ך": "kh", "ל": "l", "מ": "m", "ם": "m", "נ": "n", "ן": "n", "ס": "s",
  "ע": "'", "פ": "f", "ף": "f", "צ": "ts", "ץ": "ts", "ק": "k", "ר": "r", "ש": "sh", "ת": "t",
};
const INITIAL: Record<string, string> = { "ב": "b", "כ": "k", "פ": "p" };

/** Rule-based Hebrew to Latin transliteration. Documented as approximate. */
export function transliterate(text: string): string {
  const words = String(text ?? "").split(/(\s+)/);
  return words.map((word) => {
    if (/^\s+$/.test(word) || word === "") return word;
    let out = "";
    for (let i = 0; i < word.length; i += 1) {
      const ch = word[i];
      if (/[֑-ׇ]/.test(ch)) continue; // strip nikud and cantillation
      if (ch === "״" || ch === '"') { out += ""; continue; }
      const isFirst = out.length === 0;
      out += (isFirst && INITIAL[ch]) ? INITIAL[ch] : (TRANSLIT[ch] ?? ch);
    }
    return out;
  }).join("");
}
