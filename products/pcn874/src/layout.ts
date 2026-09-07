/**
 * The PCN874 record layout, as data.
 *
 * **Primary source since 2026-09-07: the Israel Tax Authority's own circular**,
 * Appendix 'A' (record structure), Appendix 'B' (representatives' alignment file)
 * and Appendix 'C' (permitted values). Every field below carries the line of
 * `research/rendered/pcn874-gov-il-874-eng.txt` that states it, quoted in
 * `officialText`, and the three open-source implementations follow as
 * corroboration. `docs/SPEC.md` is the prose twin of this table;
 * `tests/layout.test.ts` fails if the two drift apart.
 *
 * Where the document does not settle a question, `openQuestion` says so and the
 * validator either warns or writes no rule at all. Nothing here is inferred from
 * agreement between implementations alone any more, except where marked.
 */

import { ita } from './sources.js';

export type FieldClass = 'literal' | 'digits' | 'sign' | 'alpha' | 'alphanumeric';

export interface FieldSpec {
  readonly id: string;
  /** Hebrew name as the sources give it, empty when they give none. */
  readonly hebrew: string;
  readonly english: string;
  /** 0-based offset inside the record. */
  readonly offset: number;
  readonly length: number;
  /**
   * `literal` — one exact value; `digits` — N(n) in Appendix A; `sign` — the
   * "+/-" fields; `alpha` — the one-letter entry type, checked against the
   * Table of Values; `alphanumeric` — A(n) in Appendix A, letters or digits.
   */
  readonly class: FieldClass;
  /** For `literal` fields, the exact required text. */
  readonly literal?: string;
  /** On a `sign` field: the id of the digits field whose sign it carries. */
  readonly signs?: string;
  /** Citations, `sourceKey:path:line`. The official document comes first. */
  readonly sources: readonly string[];
  /** The official document's own words for this field, quoted into findings. */
  readonly officialText?: string;
  /** Set only where no rendered source settles the question. Quoted into findings. */
  readonly openQuestion?: string;
}

export interface RecordSpec {
  readonly kind: 'header' | 'detail' | 'footer';
  readonly length: number;
  readonly fields: readonly FieldSpec[];
  readonly sources: readonly string[];
  readonly officialText?: string;
  readonly openQuestion?: string;
}

const A = 'accounter';
const L = 'linet3';
const R = 'rcbuilder';

/**
 * Header entry — Appendix 'A', "Header Entry", lines 94-126 of the extracted
 * official text. Widths are the document's own N(n) / A(n) / "+/-", and they sum
 * to 131: 1+9+6+1+8 +1+11 +1+9 +1+11 +1+9 +9 +1+11 +1+9 +1+9 +9 +1+11.
 */
export const HEADER: RecordSpec = {
  kind: 'header',
  length: 131,
  sources: [
    ita('94-126'),
    `${A}:packages/pcn874-generator/src/index.ts:40`,
    `${R}:CODE/PCN-874/PCN874Project/PCN874Manager/PCN874Manager.cs:403-472`,
    `${R}:CODE/PCN-874/PCN874_Sample.txt:1 (measured: 131 characters)`,
  ],
  officialText:
    'Appendix A lists the header entry as 23 fields whose declared widths sum to 131 characters. ' +
    'The last of them is "Total VAT to pay / receive for period   N(11)" (line 126), which settles the ' +
    'one place the implementations disagreed: linet3 gives that field 9 digits and so would produce a ' +
    '129-character header. The document says 11.',
  fields: [
    {
      id: 'recordType',
      hebrew: '',
      english: 'record type, literal "O"',
      offset: 0,
      length: 1,
      class: 'literal',
      literal: 'O',
      sources: [
        ita('100'),
        `${A}:packages/pcn874-generator/src/utils/builders.ts:22`,
        `${L}:protected/models/FormReportPcn874.php:47,90`,
        `${R}:...PCN874Manager.cs:379,405`,
      ],
      officialText: 'Entry Type   A(1)   "O" – fixed value',
    },
    {
      id: 'licensedDealerId',
      hebrew: 'מספר עוסק',
      english: "licensed dealer's VAT id",
      offset: 1,
      length: 9,
      class: 'digits',
      sources: [
        ita('101'),
        `${A}:packages/pcn874-generator/src/schemas.ts:17-20,86`,
        `${L}:protected/models/FormReportPcn874.php:48,90`,
        `${R}:...PCN874Manager.cs:380,408`,
      ],
      officialText: "Customer's Licensed Dealer identification Number   N(9)",
    },
    {
      id: 'reportMonth',
      hebrew: 'תקופת הדיווח',
      english: 'reported period, YYYYMM',
      offset: 10,
      length: 6,
      class: 'digits',
      sources: [
        ita('102'),
        `${A}:packages/pcn874-generator/src/schemas.ts:11,21,92`,
        `${L}:protected/models/FormReportPcn874.php:49,90`,
        `${R}:...PCN874Manager.cs:381,411-414`,
      ],
      officialText: 'Month for which detailed report is being submitted   N(6)   Yyyymm form',
    },
    {
      id: 'reportType',
      hebrew: '',
      english: 'report type, literal "1"',
      offset: 16,
      length: 1,
      class: 'literal',
      literal: '1',
      sources: [
        ita('103-104'),
        `${A}:packages/pcn874-generator/src/utils/builders.ts:3,22`,
        `${A}:packages/pcn874-generator/src/index.ts:46`,
        `${L}:protected/models/FormReportPcn874.php:50,90`,
        `${R}:...PCN874Manager.cs:382,415`,
      ],
      officialText: 'Report Type   N(1)   Field Value=1, Future changes possible',
    },
    {
      id: 'generationDate',
      hebrew: 'תאריך הגשה',
      english: 'file generation date, YYYYMMDD',
      offset: 17,
      length: 8,
      class: 'digits',
      sources: [
        ita('105'),
        `${A}:packages/pcn874-generator/src/schemas.ts:12,22-25,99`,
        `${L}:protected/models/FormReportPcn874.php:51,79,90`,
        `${R}:...PCN874Manager.cs:383,417-419`,
      ],
      officialText: 'File Generation Date   N(8)   Yyyymm form',
      openQuestion:
        'The official document contradicts itself on the FORMAT of this field, though not on its width: the ' +
        'technical description is N(8) but the comment column says "Yyyymm form" (line 105), which is six ' +
        'characters — the same comment it gives the N(6) report-month field on line 102. The comment cannot ' +
        'be right for an 8-digit field. This validator reads it as YYYYMMDD, which is what all three ' +
        'implementations write, and flags a value that is not a real calendar date. Recorded rather than ' +
        'hidden: the extraction is faithful, the document is what is inconsistent.',
    },
    {
      id: 'taxableSalesAmountSign',
      hebrew: '',
      english: 'sign of taxable sales total',
      offset: 25,
      length: 1,
      class: 'sign',
      signs: 'taxableSalesAmount',
      sources: [
        ita('106'),
        `${A}:packages/pcn874-generator/src/schemas.ts:26`,
        `${L}:protected/models/FormReportPcn874.php:52,80,90`,
        `${R}:...PCN874Manager.cs:384,421`,
      ],
      officialText: '+/- symbol for total taxable sales   +/-',
    },
    {
      id: 'taxableSalesAmount',
      hebrew: 'עסקאות חייבות',
      english: 'total taxable sales excluding VAT',
      offset: 26,
      length: 11,
      class: 'digits',
      sources: [
        ita('107'),
        `${A}:packages/pcn874-generator/src/schemas.ts:26,105-109`,
        `${L}:protected/models/FormReportPcn874.php:53,90`,
        `${R}:...PCN874Manager.cs:385,424`,
      ],
      officialText: 'Total amount of taxable sales (excluding VAT)   N(11)   In the reported file',
    },
    {
      id: 'taxableSalesVatSign',
      hebrew: '',
      english: 'sign of VAT on taxable sales',
      offset: 37,
      length: 1,
      class: 'sign',
      signs: 'taxableSalesVat',
      sources: [
        ita('108'),
        `${A}:packages/pcn874-generator/src/schemas.ts:27`,
        `${L}:protected/models/FormReportPcn874.php:54,81,90`,
        `${R}:...PCN874Manager.cs:386,426`,
      ],
      officialText: '+/- symbol for total VAT on taxable sales   +/-',
    },
    {
      id: 'taxableSalesVat',
      hebrew: 'מע"מ עסקאות חייבות',
      english: 'VAT on taxable sales',
      offset: 38,
      length: 9,
      class: 'digits',
      sources: [
        ita('109'),
        `${A}:packages/pcn874-generator/src/schemas.ts:27,110-115`,
        `${L}:protected/models/FormReportPcn874.php:55,90`,
        `${R}:...PCN874Manager.cs:387,429`,
      ],
      officialText: 'Total VAT on taxable sales   N(9)   In the reported file',
    },
    {
      id: 'differentRateSalesAmountSign',
      hebrew: '',
      english: 'sign of different-rate sales total (reserved)',
      offset: 47,
      length: 1,
      class: 'sign',
      signs: 'differentRateSalesAmount',
      sources: [
        ita('110'),
        `${A}:packages/pcn874-generator/src/utils/builders.ts:4`,
        `${L}:protected/models/FormReportPcn874.php:56,82,90`,
        `${R}:...PCN874Manager.cs:388,431`,
      ],
      officialText:
        '+/- symbol for total sales taxable at   different rate   +/-   Currently "+"',
    },
    {
      id: 'differentRateSalesAmount',
      hebrew: 'עסקאות בשיעור מס אחר',
      english: 'sales taxed at a different rate — reserved, zeros',
      offset: 48,
      length: 11,
      class: 'digits',
      sources: [
        ita('111'),
        `${A}:packages/pcn874-generator/src/utils/builders.ts:4`,
        `${L}:protected/models/FormReportPcn874.php:57,90`,
        `${R}:...PCN874Manager.cs:389,432`,
      ],
      officialText:
        'Total of sales taxable at different rate (excluding VAT)   N(11)   Currently zeros – for future use',
    },
    {
      id: 'differentRateSalesVatSign',
      hebrew: '',
      english: 'sign of VAT at a different rate (reserved)',
      offset: 59,
      length: 1,
      class: 'sign',
      signs: 'differentRateSalesVat',
      sources: [
        ita('112'),
        `${A}:packages/pcn874-generator/src/utils/builders.ts:5`,
        `${L}:protected/models/FormReportPcn874.php:58,83,90`,
        `${R}:...PCN874Manager.cs:390,433`,
      ],
      officialText:
        '+/- symbol for total VAT on sales taxable at different rate   +/-   Currently "+"',
    },
    {
      id: 'differentRateSalesVat',
      hebrew: 'מע"מ בשיעור מס אחר',
      english: 'VAT on different-rate sales — reserved, zeros',
      offset: 60,
      length: 9,
      class: 'digits',
      sources: [
        ita('113'),
        `${A}:packages/pcn874-generator/src/utils/builders.ts:5`,
        `${L}:protected/models/FormReportPcn874.php:59,90`,
        `${R}:...PCN874Manager.cs:391,434`,
      ],
      officialText:
        'Total VAT on sales taxable at different rate   N(9)   Currently zeros – for future use',
    },
    {
      id: 'salesRecordCount',
      hebrew: "מס' עסקאות",
      english: 'number of sales records, taxable and zero-rated/exempt together',
      offset: 69,
      length: 9,
      class: 'digits',
      sources: [
        ita('114-115'),
        ita('181-185'),
        `${A}:packages/pcn874-generator/src/schemas.ts:28-32,116-121`,
        `${L}:protected/models/FormReportPcn874.php:60,90`,
        `${R}:...PCN874Manager.cs:392,436-437,496-500`,
      ],
      officialText:
        'Total number of records for "sales"*   N(9)   Number of sales records - both taxable and zero-rated/ exempt. ' +
        'The Table of Values (lines 181-185) marks S, L, M, Y and I as "Sales".',
    },
    {
      id: 'zeroOrExemptSalesAmountSign',
      hebrew: '',
      english: 'sign of zero-rated/exempt sales total',
      offset: 78,
      length: 1,
      class: 'sign',
      signs: 'zeroOrExemptSalesAmount',
      sources: [
        ita('116'),
        `${A}:packages/pcn874-generator/src/schemas.ts:33-36`,
        `${L}:protected/models/FormReportPcn874.php:62,85,90`,
        `${R}:...PCN874Manager.cs:393,439`,
      ],
      officialText: '+/- symbol for total of zero value and exempt sales   +/-',
    },
    {
      id: 'zeroOrExemptSalesAmount',
      hebrew: 'עסקאות פטורות / אפס',
      english: 'total zero-rated and exempt sales',
      offset: 79,
      length: 11,
      class: 'digits',
      sources: [
        ita('117'),
        `${A}:packages/pcn874-generator/src/schemas.ts:33-36,122-126`,
        `${L}:protected/models/FormReportPcn874.php:63,90`,
        `${R}:...PCN874Manager.cs:394,442,489-493`,
      ],
      officialText:
        'Total of zero value/exempt sales for period   N(11). An amount, not a count: the document gives it its ' +
        'own "+/- symbol for total of zero value and exempt sales" on the preceding line, and a record count ' +
        'has no sign. accounter\'s identifier zeroValOrExemptSalesCount is a misnomer.',
    },
    {
      id: 'otherInputsVatSign',
      hebrew: '',
      english: 'sign of VAT on other inputs',
      offset: 90,
      length: 1,
      class: 'sign',
      signs: 'otherInputsVat',
      sources: [
        ita('118'),
        `${A}:packages/pcn874-generator/src/schemas.ts:37`,
        `${L}:protected/models/FormReportPcn874.php:64,86,90`,
        `${R}:...PCN874Manager.cs:395,443`,
      ],
      officialText: '+/- symbol for total VAT on "other" (non-capital) inputs   +/-',
    },
    {
      id: 'otherInputsVat',
      hebrew: 'תשומות אחרות',
      english: 'VAT on "other" (non-capital) inputs',
      offset: 91,
      length: 9,
      class: 'digits',
      sources: [
        ita('119'),
        `${A}:packages/pcn874-generator/src/schemas.ts:37,127-131`,
        `${L}:protected/models/FormReportPcn874.php:65,90`,
        `${R}:...PCN874Manager.cs:396,446,483-487`,
      ],
      officialText: 'Total VAT on "other" inputs required during period   N(9)',
    },
    {
      id: 'equipmentInputsVatSign',
      hebrew: '',
      english: 'sign of VAT on equipment inputs',
      offset: 100,
      length: 1,
      class: 'sign',
      signs: 'equipmentInputsVat',
      sources: [
        ita('120-122'),
        `${A}:packages/pcn874-generator/src/schemas.ts:38`,
        `${L}:protected/models/FormReportPcn874.php:66,87,90`,
        `${R}:...PCN874Manager.cs:397,448`,
      ],
      officialText:
        '+/- symbol for total VAT on "equipment" inputs required during period   +/-',
    },
    {
      id: 'equipmentInputsVat',
      hebrew: 'תשומות ציוד',
      english: 'VAT on equipment (capital) inputs',
      offset: 101,
      length: 9,
      class: 'digits',
      sources: [
        ita('123'),
        `${A}:packages/pcn874-generator/src/schemas.ts:38,132-136`,
        `${L}:protected/models/FormReportPcn874.php:67,90`,
        `${R}:...PCN874Manager.cs:398,449`,
      ],
      officialText:
        'Total VAT on "equipment" inputs required during period   N(9). A real field, not a reserved one: ' +
        'rcbuilder hardcoding it to zeros ("תשומות ציוד - 0 קבוע") is that program\'s own limitation, not the format\'s.',
    },
    {
      id: 'inputsCount',
      hebrew: "מס' תשומות",
      english: 'number of input records, other and equipment together',
      offset: 110,
      length: 9,
      class: 'digits',
      sources: [
        ita('124'),
        ita('186-191'),
        `${A}:packages/pcn874-generator/src/schemas.ts:39-43,137-141`,
        `${L}:protected/models/FormReportPcn874.php:68,90`,
        `${R}:...PCN874Manager.cs:399,451-452,477-480`,
      ],
      officialText:
        'Total number of records for inputs (other and equipment)   N(9). The Table of Values (lines 186-191) ' +
        'marks T, K, R, P, H and C as "Input", so all six count — rcbuilder counting only T records is wrong.',
    },
    {
      id: 'reportedVatSign',
      hebrew: '',
      english: 'sign of the reported VAT position: "+" to pay, "-" to reclaim',
      offset: 119,
      length: 1,
      class: 'sign',
      signs: 'reportedVat',
      sources: [
        ita('125'),
        `${A}:packages/pcn874-generator/src/schemas.ts:44`,
        `${A}:packages/pcn874-generator/src/utils/data-handlers.ts:28`,
        `${L}:protected/models/FormReportPcn874.php:69,88,90`,
        `${R}:...PCN874Manager.cs:400,455-470`,
      ],
      officialText: '+/- symbol for total VAT to pay / receive   +/-   + symbol to pay',
    },
    {
      id: 'reportedVat',
      hebrew: 'סכום מדווח',
      english: 'VAT to pay or reclaim for the period',
      offset: 120,
      length: 11,
      class: 'digits',
      sources: [
        ita('126'),
        `${A}:packages/pcn874-generator/src/schemas.ts:44,142-148`,
        `${R}:...PCN874Manager.cs:401,472`,
      ],
      officialText: 'Total VAT to pay / receive for period   N(11)',
      openQuestion:
        'The document defines the field and its width but NEVER states how the value is computed — there is no ' +
        'formula anywhere in Appendix A, B or C, and neither Hebrew manual gives one. The three implementations ' +
        'give three different answers (rcbuilder: taxable-sales VAT minus other inputs; linet3: sales VAT only; ' +
        'accounter: none, the caller supplies it). So this validator implements no arithmetic check on it. ' +
        'A related fact from the H-ERP manual (lines 1163-1168) argues the same way for every amount: the ' +
        'Authority requires each journal entry to be rounded before summing, so the header totals can differ ' +
        'from the unrounded books "by a few tens of shekels", and that difference must not stop the filing.',
    },
  ],
};

/**
 * Transaction entry — Appendix 'A', "Transaction Entries", lines 127-152.
 * Widths sum to 60: 1+9+8+4+9+9+1+10+9.
 */
export const DETAIL: RecordSpec = {
  kind: 'detail',
  length: 60,
  sources: [
    ita('127-152'),
    `${A}:packages/pcn874-generator/src/index.ts:63`,
    `${L}:protected/models/Docs.php:178-206`,
    `${R}:CODE/PCN-874/PCN874Project/PCN874Manager/PCN874Manager.cs:303-341`,
    `${R}:CODE/PCN-874/PCN874_Sample.txt:2-43 (measured: 60 characters each)`,
  ],
  officialText:
    'Appendix A lists the transaction entry as 9 fields whose declared widths sum to 60 characters. ' +
    'The entry type is A(1) — one character — which settles the question the implementations left open: ' +
    'the two-character codes S1/S2/L1/L2 exist only in software APIs, never in the file.',
  fields: [
    {
      id: 'recordType',
      hebrew: 'סוג רשומה',
      english: 'one-letter entry type',
      offset: 0,
      length: 1,
      class: 'alpha',
      sources: [
        ita('133'),
        ita('176-192'),
        `${A}:packages/pcn874-generator/src/types.ts:4-86`,
        `${A}:packages/pcn874-generator/src/index.ts:65`,
        `${L}:protected/models/Docs.php:179,192-206`,
        `${R}:...PCN874Manager.cs:281-293,305,330`,
      ],
      officialText:
        'Entry Type (document type)   A(1)   See attached table of values. The Table of Values (lines 176-192) ' +
        'gives exactly eleven one-letter values: S L M Y I for sales, T K R P H C for inputs. A taxable sale ' +
        'and a zero-rated one share the letter S (and L for unidentified customers); Appendix C tells them ' +
        'apart by the VAT sum being zeros, not by the letter.',
    },
    {
      id: 'counterpartyVatId',
      hebrew: 'ספק / לקוח / רשימון',
      english: "the other side's VAT id: customer for sales, supplier for inputs",
      offset: 1,
      length: 9,
      class: 'digits',
      sources: [
        ita('134-137'),
        ita('250-515'),
        `${A}:packages/pcn874-generator/src/schemas.ts:159,308-317`,
        `${L}:protected/models/Docs.php:180,206`,
        `${R}:...PCN874Manager.cs:306,332`,
      ],
      officialText:
        'VAT identification number – of the other side of the transaction   N(9)   For transactions entries – ' +
        'the customer / For inputs – the supplier. Appendix C gives the value per entry type: zeros for L and K, ' +
        'the export entry number or "999999999" for Y, the import entry for R, the supplier for M (a self ' +
        'invoice carries the supplier), the customer or supplier otherwise.',
    },
    {
      id: 'invoiceDate',
      hebrew: 'תאריך החשבונית',
      english: 'invoice date, YYYYMMDD',
      offset: 10,
      length: 8,
      class: 'digits',
      sources: [
        ita('138'),
        `${A}:packages/pcn874-generator/src/schemas.ts:161,328-333`,
        `${L}:protected/models/Docs.php:181,206`,
        `${R}:...PCN874Manager.cs:307,333`,
      ],
      officialText:
        'Invoice Date/Reference   N(8)   YYYYMMDD. For L it is the date of aggregation — "in a monthly ' +
        'aggregation – the last day of the month" (lines 547-549); for R and Y, the import or export entry date.',
    },
    {
      id: 'refGroup',
      hebrew: 'קבוצת אסמכתא',
      english: 'reference group / series — letters or digits, zeros allowed',
      offset: 18,
      length: 4,
      class: 'alphanumeric',
      sources: [
        ita('139'),
        ita('580-581'),
        `${A}:packages/pcn874-generator/src/schemas.ts:162,334-342`,
        `${L}:protected/models/Docs.php:182,206`,
        `${R}:...PCN874Manager.cs:308,334`,
      ],
      officialText:
        'Reference group   A(4)   Series etc.   zeros are possible at this stage (line 139), and: "Reference ' +
        'Group Field – enables attribution of reference to branch etc., zero values or internal characters of ' +
        'the submitter (series/branch etc.)" (lines 580-581). A(4), not N(4): this is the one field where the ' +
        'official document contradicts ALL THREE implementations, every one of which writes digits only. ' +
        'Rejecting a letter here would reject a legal file.',
    },
    {
      id: 'refNumber',
      hebrew: 'מספר אסמכתא',
      english: 'reference / invoice number, the 9 rightmost positions',
      offset: 22,
      length: 9,
      class: 'digits',
      sources: [
        ita('141'),
        `${A}:packages/pcn874-generator/src/schemas.ts:163,343-351`,
        `${L}:protected/models/Docs.php:183,206`,
        `${R}:...PCN874Manager.cs:309,335`,
      ],
      officialText:
        'Reference number   N(9)   First 9 positions from the right. Appendix C repurposes it per entry type: ' +
        'for L and K it carries the number of invoices in the aggregated entry (lines 303-304, 446, 544-546, 572); ' +
        'for R it is zeros (line 467); for H, "if unknown: will be entered as zeros" (line 573).',
    },
    {
      id: 'totalVat',
      hebrew: 'סכום המע"מ',
      english: 'VAT on the document, rounded, always positive',
      offset: 31,
      length: 9,
      class: 'digits',
      sources: [
        ita('142-144'),
        `${A}:packages/pcn874-generator/src/schemas.ts:164-167,352-357`,
        `${L}:protected/models/Docs.php:184,206`,
        `${R}:...PCN874Manager.cs:310,336`,
      ],
      officialText:
        'Total VAT in invoice / total VAT that is allowed (1/4…. 2/3…)   N(9)   Rounded to the nearest shekel ' +
        '– always a positive value. Appendix C requires zeros for Y (export) and for the zero-rated/exempt ' +
        'variants of S and L.',
    },
    {
      id: 'invoiceSumSign',
      hebrew: '',
      english: 'sign of the document total; a cancellation or credit is "-"',
      offset: 40,
      length: 1,
      class: 'sign',
      signs: 'invoiceSum',
      sources: [
        ita('145-146'),
        ita('523-535'),
        `${A}:packages/pcn874-generator/src/schemas.ts:168-171`,
        `${L}:protected/models/Docs.php:185,204,206`,
        `${R}:...PCN874Manager.cs:311,337`,
      ],
      officialText:
        '+/- symbol: credit/summary invoice   A(1)   Cancellation/credit from supplier or customer – always in ' +
        'minus. Appendix C §2 gives the whole table: sale "+", credit to the customer "-", purchase "+", ' +
        'credit from the supplier "-", zero-value field "+".',
    },
    {
      id: 'invoiceSum',
      hebrew: 'סכום',
      english: 'document total excluding VAT, rounded, absolute value',
      offset: 41,
      length: 10,
      class: 'digits',
      sources: [
        ita('148-149'),
        `${A}:packages/pcn874-generator/src/schemas.ts:168-171,358-363`,
        `${L}:protected/models/Docs.php:186,206`,
        `${R}:...PCN874Manager.cs:312,338`,
      ],
      officialText:
        'Invoice total not incl. VAT   N(10)   Always the 100%, always a positive value, rounded to the nearest ' +
        'shekel. "Always the 100%" is the instruction that a partly deductible input still reports the whole ' +
        'document total here, while the VAT field carries only the allowed fraction.',
    },
    {
      id: 'allocationNumber',
      hebrew: 'מספר הקצאה קצר',
      english: 'reserved field — allocation number in the current regime, zeros in 2009',
      offset: 51,
      length: 9,
      class: 'digits',
      sources: [
        ita('150-152'),
        ita('583-584'),
        ita('59-61'),
        'herp:research/rendered/pcn874-h-erp-mirror.txt:126-127,303,507-508',
        `${A}:packages/pcn874-generator/src/schemas.ts:160,318-327`,
        `${L}:protected/models/Docs.php:187,206`,
        `${R}:...PCN874Manager.cs:313,339`,
      ],
      officialText:
        'Space for   future   data   N(9)   Reference number to be allocated by "Sha\'am" to the supplier ' +
        '(lines 150-152), and: "Future Field – intended for the subject of ascribing invoices as transactions. ' +
        'At this stage, the value in this field will be zeros" (lines 583-584). Appendix C\'s "For Future ' +
        'Allocation" column is "Zeros" in all thirteen rows. The circular already anticipates the change on ' +
        'lines 59-61: "From 1/2011 Sha\'am will allocate account numbers to users". The H-ERP manual, current ' +
        'to 2025 SP2, describes the regime that arrived: from 1/1/26 an invoice of ₪10,000 or more before VAT ' +
        'must carry an allocation number, of which "the 9 rightmost characters" are recorded. So both zeros and ' +
        'a real 9-digit number are legitimate, depending on the period and the invoice — this validator accepts ' +
        'either and asserts nothing about which is required.',
      openQuestion:
        'The 2009 circular says zeros; the only rendered source for the allocation-number regime is a software ' +
        'vendor\'s manual, not a Tax Authority document. Whether a given invoice REQUIRES an allocation number ' +
        'is a legal question about the filer\'s own invoices, and this product does not answer it. The H-ERP ' +
        'manual is itself inconsistent about the threshold — ₪10,000 on lines 126, 303 and 507, ₪20,000 on ' +
        'line 1637 — which is exactly why no threshold is encoded here.',
    },
  ],
};

/** Closing entry — Appendix 'A', "Closing Entry", lines 154-161. 1+9 = 10. */
export const FOOTER: RecordSpec = {
  kind: 'footer',
  length: 10,
  sources: [
    ita('154-161'),
    `${A}:packages/pcn874-generator/src/index.ts:51-57`,
    `${R}:CODE/PCN-874/PCN874Project/PCN874Manager/PCN874Manager.cs:531,569`,
    `${R}:CODE/PCN-874/PCN874_Sample.txt:44 (measured: "X" + 9 digits)`,
  ],
  officialText:
    'Closing Entry: Entry Type   A(1)   "X" – fixed value; Licensed Dealer Identification Number of submitter   N(9).',
  fields: [
    {
      id: 'recordType',
      hebrew: '',
      english: 'record type, literal "X"',
      offset: 0,
      length: 1,
      class: 'literal',
      literal: 'X',
      sources: [
        ita('158'),
        ita('209'),
        `${A}:packages/pcn874-generator/src/utils/builders.ts:41`,
        `${R}:...PCN874Manager.cs:531,569`,
      ],
      officialText:
        'Entry Type   A(1)   "X" – fixed value (line 158). "Z" is a real letter in this format, but it belongs ' +
        'to a different file: Appendix B\'s summary entry for a representative reporting for several users, ' +
        '"Entry Type   A(1)   \'Z\' – fixed value" (line 209). An individual merchant\'s PCN874 closes with X.',
    },
    {
      id: 'licensedDealerId',
      hebrew: 'מספר עוסק',
      english: "licensed dealer's VAT id of the submitter, repeated from the header",
      offset: 1,
      length: 9,
      class: 'digits',
      sources: [
        ita('159-161'),
        `${A}:packages/pcn874-generator/src/utils/builders.ts:41`,
        `${L}:protected/models/FormReportPcn874.php:96-98`,
        `${R}:...PCN874Manager.cs:531,569`,
      ],
      officialText: 'Licensed Dealer Identification Number of submitter   N(9)',
    },
  ],
};

/**
 * The eleven one-letter entry types, with the Tax Authority's own names.
 * Table of Values, lines 176-192 of the extracted official text.
 */
export const RECORD_TYPES: Readonly<
  Record<
    string,
    {
      readonly side: 'sale' | 'input';
      /** The document's own wording. */
      readonly name: string;
      readonly hebrew: string;
      readonly source: string;
    }
  >
> = Object.freeze({
  S: { side: 'sale', name: 'Sales – "regular" sale', hebrew: 'עסקה מזוהה', source: ita('181') },
  L: {
    side: 'sale',
    name: 'Sales – for unidentified (private) customer',
    hebrew: 'עסקה לא מזוהה',
    source: ita('182'),
  },
  M: { side: 'sale', name: 'Sales – self invoice', hebrew: 'חשבונית עצמית (עסקה)', source: ita('183') },
  Y: { side: 'sale', name: 'Sales – export', hebrew: 'ייצוא', source: ita('184') },
  I: {
    side: 'sale',
    name: 'Sales – Palestinian Authority customer',
    hebrew: 'לקוח רש"פ',
    source: ita('185'),
  },
  T: {
    side: 'input',
    name: 'Input – "regular" from Israeli Supplier',
    hebrew: 'תשומה רגילה',
    source: ita('186'),
  },
  K: { side: 'input', name: 'Input – Petty Cash', hebrew: 'קופה קטנה', source: ita('187') },
  R: { side: 'input', name: 'Input – Import', hebrew: 'רשימון יבוא', source: ita('188') },
  P: {
    side: 'input',
    name: 'Input – Supplier from Palestinian Authority',
    hebrew: 'ספק רש"פ',
    source: ita('189'),
  },
  H: {
    side: 'input',
    name: 'Input – Single document by law',
    hebrew: 'מסמך אחר',
    source: ita('190'),
  },
  C: {
    side: 'input',
    name: 'Input – self invoice',
    hebrew: 'חשבונית עצמית (תשומה)',
    source: ita('191'),
  },
});

export const RECORD_TYPE_LETTERS: readonly string[] = Object.freeze(Object.keys(RECORD_TYPES).sort());

export const HEADER_RECORD_TYPE = 'O';
export const FOOTER_RECORD_TYPE = 'X';

/**
 * Appendix 'B' — the file a representative (CPA, tax advisor) submits for
 * several users at once. Its initial entry is "A" and its summary entry is "Z"
 * (lines 194-215). **This validator does not validate that file**; the letters
 * are here so a file that starts with one gets a finding that says what it is,
 * instead of "unknown record type".
 */
export const REPRESENTATIVE_INITIAL_RECORD_TYPE = 'A';
export const REPRESENTATIVE_SUMMARY_RECORD_TYPE = 'Z';
export const REPRESENTATIVE_SOURCE = ita('194-215');

export const RECORD_SPECS: readonly RecordSpec[] = Object.freeze([HEADER, DETAIL, FOOTER]);

export function fieldsOf(spec: RecordSpec): readonly FieldSpec[] {
  return spec.fields;
}

export function findField(spec: RecordSpec, id: string): FieldSpec | undefined {
  return spec.fields.find(f => f.id === id);
}

/** The digits field a `sign` field carries the sign of, when the layout links them. */
export function magnitudeOf(spec: RecordSpec, signField: FieldSpec): FieldSpec | undefined {
  return signField.signs === undefined ? undefined : findField(spec, signField.signs);
}
