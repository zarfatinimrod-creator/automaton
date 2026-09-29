// Leads that state the user's gain (TikTok note N9).
//
// Hebrew buyer-side framing drew about four times the plays of seller-side tips
// in the captures (research/tiktok/08-sales-marketing-lessons.md §6.2 item 3),
// so a tool's lead opens with what the user gets, not what the tool is. Every
// tool page also says, once, that the result shows at once with no details left
// and no call - TJ's "fit call" replaced by a page. Never "יתקבל" or "מאושר": a
// lead may not promise acceptance or approval by anyone.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { textOf } from './helpers/html.js';
import { productRoot } from './helpers/product-copy.js';

const read = (p) => readFileSync(join(productRoot, p), 'utf8');
const leadOf = (html) => /<p class="lead">([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '';
const NO_DETAILS = 'התוצאה מוצגת מיד, בלי להשאיר פרטים ובלי שיחה.';

/** The tool pages whose result is a number or a verdict shown on the spot. */
const TOOLS = ['vat.html', 'osek-patur.html', 'net-salary.html', 'allocation.html', 'registrar-fee.html', 'pcn874.html'];

describe('the leads', () => {
  it('pcn874.html opens with the moment it is for: before sending the detailed report', () => {
    expect(textOf(leadOf(read('pcn874.html')))).toMatch(/^לפני ששולחים את הדוח המפורט: בדיקת מבנה שורה-שורה, בדפדפן, בלי העלאה\./);
  });

  it('osek-patur.html opens with how much is left this year and when to get ready', () => {
    expect(textOf(leadOf(read('osek-patur.html')))).toMatch(/^כמה נשאר לכם עד התקרה השנה, ומתי כדאי להיערך\./);
  });

  it('every tool page says once, right after its lead, that the result is immediate with no details and no call', () => {
    for (const page of TOOLS) {
      const html = read(page);
      const count = html.split(NO_DETAILS).length - 1;
      expect(count, page).toBe(1);
      const lead = /<p class="lead">[\s\S]*?<\/p>/.exec(html)[0];
      const afterLead = html.slice(html.indexOf(lead) + lead.length, html.indexOf(NO_DETAILS));
      // Only the source line (N8) may stand between the lead and this line.
      expect(afterLead.replace(/<p class="note[^"]*" id="(?:ceiling|rate)-(?:source|stale)"[^>]*>[\s\S]*?<\/p>/g, '').trim(), page).toBe('<p class="note">');
    }
  });

  it('no lead promises acceptance or approval', () => {
    for (const page of [...TOOLS, 'invoice.html', 'index.html']) {
      expect(textOf(leadOf(read(page))), page).not.toMatch(/יתקבל|מאושר|יאושר/);
    }
  });
});
