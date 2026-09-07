/**
 * The PCN874 record layout, as data.
 *
 * Every field carries the repo+path+line that supports its offset and width.
 * The table here is the machine-readable twin of docs/SPEC-FROM-SOURCES.md;
 * `tests/layout.test.ts` checks the two cannot drift apart on the totals.
 */

export type FieldClass = 'literal' | 'digits' | 'sign' | 'alpha';

export interface FieldSpec {
  readonly id: string;
  /** Hebrew name as the sources give it, empty when they give none. */
  readonly hebrew: string;
  readonly english: string;
  /** 0-based offset inside the record. */
  readonly offset: number;
  readonly length: number;
  readonly class: FieldClass;
  /** For `literal` fields, the exact required text. */
  readonly literal?: string;
  /** Citations, `sourceKey:path:line`. */
  readonly sources: readonly string[];
  /** Set when the sources disagree about this field; the text is quoted into findings. */
  readonly disagreement?: string;
}

export interface RecordSpec {
  readonly kind: 'header' | 'detail' | 'footer';
  readonly length: number;
  readonly fields: readonly FieldSpec[];
  readonly sources: readonly string[];
  readonly disagreement?: string;
}

const A = 'accounter';
const L = 'linet3';
const R = 'rcbuilder';

export const HEADER: RecordSpec = {
  kind: 'header',
  length: 131,
  sources: [
    `${A}:packages/pcn874-generator/src/utils/builders.ts:22`,
    `${A}:packages/pcn874-generator/src/index.ts:40`,
    `${R}:CODE/PCN-874/PCN874Project/PCN874Manager/PCN874Manager.cs:403-472`,
    `${R}:CODE/PCN-874/PCN874_Sample.txt:1 (measured: 131 characters)`,
  ],
  disagreement:
    "linet3's layout comment (protected/models/FormReportPcn874.php:69-70) gives the last field as sign+9, " +
    'which would make the header 129; its own sprintf at :90 has 20 conversion specifications for 21 ' +
    'arguments, so it matches neither 131 nor its own comment. See docs/SPEC-FROM-SOURCES.md §5.1.',
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
        `${A}:packages/pcn874-generator/src/utils/builders.ts:22`,
        `${L}:protected/models/FormReportPcn874.php:47,90`,
        `${R}:...PCN874Manager.cs:379,405`,
      ],
    },
    {
      id: 'licensedDealerId',
      hebrew: 'מספר עוסק',
      english: "licensed dealer's VAT id",
      offset: 1,
      length: 9,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:17-20,86`,
        `${L}:protected/models/FormReportPcn874.php:48,90`,
        `${R}:...PCN874Manager.cs:380,408`,
      ],
    },
    {
      id: 'reportMonth',
      hebrew: 'תקופת הדיווח',
      english: 'reported period, YYYYMM',
      offset: 10,
      length: 6,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:11,21,92`,
        `${L}:protected/models/FormReportPcn874.php:49,90`,
        `${R}:...PCN874Manager.cs:381,411-414`,
      ],
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
        `${A}:packages/pcn874-generator/src/utils/builders.ts:3,22`,
        `${A}:packages/pcn874-generator/src/index.ts:46`,
        `${L}:protected/models/FormReportPcn874.php:50,90`,
        `${R}:...PCN874Manager.cs:382,415`,
      ],
    },
    {
      id: 'generationDate',
      hebrew: 'תאריך הגשה',
      english: 'file generation date, YYYYMMDD',
      offset: 17,
      length: 8,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:12,22-25,99`,
        `${L}:protected/models/FormReportPcn874.php:51,79,90`,
        `${R}:...PCN874Manager.cs:383,417-419`,
      ],
    },
    {
      id: 'taxableSalesAmountSign',
      hebrew: '',
      english: 'sign of taxable sales total',
      offset: 25,
      length: 1,
      class: 'sign',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:26`,
        `${L}:protected/models/FormReportPcn874.php:52,80,90`,
        `${R}:...PCN874Manager.cs:384,421`,
      ],
    },
    {
      id: 'taxableSalesAmount',
      hebrew: 'עסקאות חייבות',
      english: 'total taxable sales excluding VAT',
      offset: 26,
      length: 11,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:26,105-109`,
        `${L}:protected/models/FormReportPcn874.php:53,90`,
        `${R}:...PCN874Manager.cs:385,424`,
      ],
    },
    {
      id: 'taxableSalesVatSign',
      hebrew: '',
      english: 'sign of VAT on taxable sales',
      offset: 37,
      length: 1,
      class: 'sign',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:27`,
        `${L}:protected/models/FormReportPcn874.php:54,81,90`,
        `${R}:...PCN874Manager.cs:386,426`,
      ],
    },
    {
      id: 'taxableSalesVat',
      hebrew: 'מע"מ עסקאות חייבות',
      english: 'VAT on taxable sales',
      offset: 38,
      length: 9,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:27,110-115`,
        `${L}:protected/models/FormReportPcn874.php:55,90`,
        `${R}:...PCN874Manager.cs:387,429`,
      ],
    },
    {
      id: 'differentRateSalesAmountSign',
      hebrew: '',
      english: 'sign of different-rate sales total (reserved)',
      offset: 47,
      length: 1,
      class: 'sign',
      sources: [
        `${A}:packages/pcn874-generator/src/utils/builders.ts:4`,
        `${L}:protected/models/FormReportPcn874.php:56,82,90`,
        `${R}:...PCN874Manager.cs:388,431`,
      ],
    },
    {
      id: 'differentRateSalesAmount',
      hebrew: 'עסקאות בשיעור מס אחר',
      english: 'sales taxed at a different rate — reserved, zeros',
      offset: 48,
      length: 11,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/utils/builders.ts:4`,
        `${L}:protected/models/FormReportPcn874.php:57,90`,
        `${R}:...PCN874Manager.cs:389,432 ("Currently zeros – for future use")`,
      ],
    },
    {
      id: 'differentRateSalesVatSign',
      hebrew: '',
      english: 'sign of VAT at a different rate (reserved)',
      offset: 59,
      length: 1,
      class: 'sign',
      sources: [
        `${A}:packages/pcn874-generator/src/utils/builders.ts:5`,
        `${L}:protected/models/FormReportPcn874.php:58,83,90`,
        `${R}:...PCN874Manager.cs:390,433`,
      ],
    },
    {
      id: 'differentRateSalesVat',
      hebrew: 'מע"מ בשיעור מס אחר',
      english: 'VAT on different-rate sales — reserved, zeros',
      offset: 60,
      length: 9,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/utils/builders.ts:5`,
        `${L}:protected/models/FormReportPcn874.php:59,90`,
        `${R}:...PCN874Manager.cs:391,434 ("Currently zeros – for future use")`,
      ],
    },
    {
      id: 'salesRecordCount',
      hebrew: "מס' עסקאות",
      english: 'number of sales records, taxable and zero-rated/exempt together',
      offset: 69,
      length: 9,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:28-32,116-121`,
        `${L}:protected/models/FormReportPcn874.php:60,90`,
        `${R}:...PCN874Manager.cs:392,436-437,496-500`,
      ],
    },
    {
      id: 'zeroOrExemptSalesAmountSign',
      hebrew: '',
      english: 'sign of zero-rated/exempt sales total',
      offset: 78,
      length: 1,
      class: 'sign',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:33-36`,
        `${L}:protected/models/FormReportPcn874.php:62,85,90`,
        `${R}:...PCN874Manager.cs:393,439`,
      ],
    },
    {
      id: 'zeroOrExemptSalesAmount',
      hebrew: 'עסקאות פטורות / אפס',
      english: 'total zero-rated and exempt sales',
      offset: 79,
      length: 11,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:33-36,122-126`,
        `${L}:protected/models/FormReportPcn874.php:63,90`,
        `${R}:...PCN874Manager.cs:394,442,489-493`,
      ],
      disagreement:
        "accounter names this field zeroValOrExemptSalesCount, which reads as a record count; its own doc " +
        'comment (schemas.ts:122-126) and both other sources treat it as an amount. ' +
        'See docs/SPEC-FROM-SOURCES.md §5.3.',
    },
    {
      id: 'otherInputsVatSign',
      hebrew: '',
      english: 'sign of VAT on other inputs',
      offset: 90,
      length: 1,
      class: 'sign',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:37`,
        `${L}:protected/models/FormReportPcn874.php:64,86,90`,
        `${R}:...PCN874Manager.cs:395,443`,
      ],
    },
    {
      id: 'otherInputsVat',
      hebrew: 'תשומות אחרות',
      english: 'VAT on "other" inputs',
      offset: 91,
      length: 9,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:37,127-131`,
        `${L}:protected/models/FormReportPcn874.php:65,90`,
        `${R}:...PCN874Manager.cs:396,446,483-487`,
      ],
    },
    {
      id: 'equipmentInputsVatSign',
      hebrew: '',
      english: 'sign of VAT on equipment inputs',
      offset: 100,
      length: 1,
      class: 'sign',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:38`,
        `${L}:protected/models/FormReportPcn874.php:66,87,90`,
        `${R}:...PCN874Manager.cs:397,448`,
      ],
    },
    {
      id: 'equipmentInputsVat',
      hebrew: 'תשומות ציוד',
      english: 'VAT on equipment inputs',
      offset: 101,
      length: 9,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:38,132-136`,
        `${L}:protected/models/FormReportPcn874.php:67,90`,
        `${R}:...PCN874Manager.cs:398,449`,
      ],
      disagreement:
        'rcbuilder hardcodes this field to zeros ("תשומות ציוד - 0 קבוע", PCN874Manager.cs:36,398); accounter ' +
        'treats it as a real input. See docs/SPEC-FROM-SOURCES.md §5.4.',
    },
    {
      id: 'inputsCount',
      hebrew: "מס' תשומות",
      english: 'number of input records',
      offset: 110,
      length: 9,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:39-43,137-141`,
        `${L}:protected/models/FormReportPcn874.php:68,90`,
        `${R}:...PCN874Manager.cs:399,451-452,477-480`,
      ],
      disagreement:
        'rcbuilder counts only T records (PCN874Manager.cs:477-480); accounter says "other and equipment". ' +
        'Whether K/R/P/H/C count is unsettled. See docs/SPEC-FROM-SOURCES.md §5.4.',
    },
    {
      id: 'reportedVatSign',
      hebrew: '',
      english: 'sign of the reported VAT position: "+" to pay, "-" to reclaim',
      offset: 119,
      length: 1,
      class: 'sign',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:44`,
        `${A}:packages/pcn874-generator/src/utils/data-handlers.ts:28`,
        `${L}:protected/models/FormReportPcn874.php:69,88,90`,
        `${R}:...PCN874Manager.cs:400,455-470`,
      ],
    },
    {
      id: 'reportedVat',
      hebrew: 'סכום מדווח',
      english: 'VAT to pay or reclaim for the period',
      offset: 120,
      length: 11,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:44,142-148`,
        `${R}:...PCN874Manager.cs:401,472`,
      ],
      disagreement:
        'linet3 gives this field 9 digits, not 11 (FormReportPcn874.php:70). Three sources also give three ' +
        'different formulas for its value, so no arithmetic check is implemented. ' +
        'See docs/SPEC-FROM-SOURCES.md §5.1 and §5.7.',
    },
  ],
};

export const DETAIL: RecordSpec = {
  kind: 'detail',
  length: 60,
  sources: [
    `${A}:packages/pcn874-generator/src/utils/builders.ts:37`,
    `${A}:packages/pcn874-generator/src/index.ts:63`,
    `${L}:protected/models/Docs.php:178-206`,
    `${R}:CODE/PCN-874/PCN874Project/PCN874Manager/PCN874Manager.cs:303-341`,
    `${R}:CODE/PCN-874/PCN874_Sample.txt:2-43 (measured: 60 characters each)`,
  ],
  fields: [
    {
      id: 'recordType',
      hebrew: 'סוג רשומה',
      english: 'one-letter record type',
      offset: 0,
      length: 1,
      class: 'alpha',
      sources: [
        `${A}:packages/pcn874-generator/src/types.ts:4-86`,
        `${A}:packages/pcn874-generator/src/schemas.ts:158`,
        `${A}:packages/pcn874-generator/src/index.ts:65`,
        `${L}:protected/models/Docs.php:179,192-206`,
        `${R}:...PCN874Manager.cs:281-293,305,330`,
      ],
      disagreement:
        'accounter keeps two-character logical codes S1/S2/L1/L2 in its API (packages/client/src/helpers/' +
        'pcn874.ts:3-17) but writes only the first character to the file, so a taxable sale and a zero-rated ' +
        'one are indistinguishable by record type in every source read. See docs/SPEC-FROM-SOURCES.md §4.1.',
    },
    {
      id: 'counterpartyVatId',
      hebrew: 'ספק / לקוח',
      english: "the other side's VAT id: customer for sales, supplier for inputs",
      offset: 1,
      length: 9,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:159,308-317`,
        `${L}:protected/models/Docs.php:180,206`,
        `${R}:...PCN874Manager.cs:306,332`,
      ],
    },
    {
      id: 'invoiceDate',
      hebrew: 'תאריך החשבונית',
      english: 'invoice date, YYYYMMDD',
      offset: 10,
      length: 8,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:161,328-333`,
        `${L}:protected/models/Docs.php:181,206`,
        `${R}:...PCN874Manager.cs:307,333`,
      ],
    },
    {
      id: 'refGroup',
      hebrew: 'קבוצת אסמכתא',
      english: 'reference group / series; zeros are allowed',
      offset: 18,
      length: 4,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:162,334-342`,
        `${L}:protected/models/Docs.php:182,206`,
        `${R}:...PCN874Manager.cs:308,334`,
      ],
    },
    {
      id: 'refNumber',
      hebrew: 'מספר אסמכתא',
      english: 'reference / invoice number, 9 rightmost positions',
      offset: 22,
      length: 9,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:163,343-351`,
        `${L}:protected/models/Docs.php:183,206`,
        `${R}:...PCN874Manager.cs:309,335`,
      ],
    },
    {
      id: 'totalVat',
      hebrew: 'סכום המע"מ',
      english: 'VAT on the document, rounded, always positive',
      offset: 31,
      length: 9,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:164-167,352-357`,
        `${L}:protected/models/Docs.php:184,206`,
        `${R}:...PCN874Manager.cs:310,336`,
      ],
    },
    {
      id: 'invoiceSumSign',
      hebrew: '',
      english: 'sign of the document total; a credit note is "-"',
      offset: 40,
      length: 1,
      class: 'sign',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:168-171`,
        `${L}:protected/models/Docs.php:185,204,206`,
        `${R}:...PCN874Manager.cs:311,337`,
      ],
    },
    {
      id: 'invoiceSum',
      hebrew: 'סכום',
      english: 'document total excluding VAT, rounded, absolute value',
      offset: 41,
      length: 10,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:168-171,358-363`,
        `${L}:protected/models/Docs.php:186,206`,
        `${R}:...PCN874Manager.cs:312,338`,
      ],
    },
    {
      id: 'allocationNumber',
      hebrew: 'מספר הקצאה קצר',
      english: 'short allocation number — last 9 digits; zeros in the older sources',
      offset: 51,
      length: 9,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/schemas.ts:160,318-327`,
        `${A}:packages/pcn874-generator/src/utils/builders.ts:37`,
        `${L}:protected/models/Docs.php:187,206`,
        `${R}:...PCN874Manager.cs:313,339`,
      ],
      disagreement:
        'accounter v0.6.7 calls this the short allocation number; rcbuilder (2023) calls it FutureData "all ' +
        'zero" and linet3 writes a literal 000000000. All three agree it is 9 digits at offset 51. ' +
        'See docs/SPEC-FROM-SOURCES.md §5.2.',
    },
  ],
};

export const FOOTER: RecordSpec = {
  kind: 'footer',
  length: 10,
  sources: [
    `${A}:packages/pcn874-generator/src/utils/builders.ts:40-42`,
    `${A}:packages/pcn874-generator/src/index.ts:51-57`,
    `${R}:CODE/PCN-874/PCN874Project/PCN874Manager/PCN874Manager.cs:531,569`,
    `${R}:CODE/PCN-874/PCN874_Sample.txt:44 (measured: "X" + 9 digits)`,
  ],
  disagreement:
    'linet3 writes "Z" rather than "X" (protected/models/FormReportPcn874.php:94-99). Two sources and two ' +
    'committed artefacts say "X". See docs/SPEC-FROM-SOURCES.md §5.5.',
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
        `${A}:packages/pcn874-generator/src/utils/builders.ts:41`,
        `${A}:packages/pcn874-generator/src/index.ts:55`,
        `${R}:...PCN874Manager.cs:531,569`,
      ],
      disagreement:
        'linet3 writes "Z" (protected/models/FormReportPcn874.php:98). See docs/SPEC-FROM-SOURCES.md §5.5.',
    },
    {
      id: 'licensedDealerId',
      hebrew: 'מספר עוסק',
      english: "licensed dealer's VAT id, repeated from the header",
      offset: 1,
      length: 9,
      class: 'digits',
      sources: [
        `${A}:packages/pcn874-generator/src/utils/builders.ts:41`,
        `${L}:protected/models/FormReportPcn874.php:96-98`,
        `${R}:...PCN874Manager.cs:531,569`,
      ],
    },
  ],
};

/** The eleven one-letter record types, and which side of the report each sits on. */
export const RECORD_TYPES: Readonly<
  Record<string, { readonly side: 'sale' | 'input'; readonly name: string; readonly hebrew: string }>
> = Object.freeze({
  S: { side: 'sale', name: 'SALE_REGULAR / SALE_ZERO_OR_EXEMPT', hebrew: 'עסקה מזוהה' },
  L: {
    side: 'sale',
    name: 'SALE_UNIDENTIFIED_CUSTOMER / SALE_UNIDENTIFIED_ZERO_OR_EXEMPT',
    hebrew: 'עסקה לא מזוהה',
  },
  M: { side: 'sale', name: 'SALE_SELF_INVOICE', hebrew: 'חשבונית עצמית (עסקה)' },
  Y: { side: 'sale', name: 'SALE_EXPORT', hebrew: 'ייצוא' },
  I: { side: 'sale', name: 'SALE_PALESTINIAN_CUSTOMER', hebrew: 'לקוח רש"פ' },
  T: { side: 'input', name: 'INPUT_REGULAR', hebrew: 'תשומה רגילה' },
  K: { side: 'input', name: 'INPUT_PETTY_CASH', hebrew: 'קופה קטנה' },
  R: { side: 'input', name: 'INPUT_IMPORT', hebrew: 'רשימון יבוא' },
  P: { side: 'input', name: 'INPUT_PALESTINIAN_SUPPLIER', hebrew: 'ספק רש"פ' },
  H: { side: 'input', name: 'INPUT_SINGLE_DOC_BY_LAW', hebrew: 'מסמך אחר' },
  C: { side: 'input', name: 'INPUT_SELF_INVOICE', hebrew: 'חשבונית עצמית (תשומה)' },
});

export const RECORD_TYPE_LETTERS: readonly string[] = Object.freeze(Object.keys(RECORD_TYPES).sort());

export const HEADER_RECORD_TYPE = 'O';
export const FOOTER_RECORD_TYPE = 'X';
/** The footer letter linet3 writes instead; recognised so the finding can name it. */
export const FOOTER_RECORD_TYPE_LINET3 = 'Z';

export const RECORD_SPECS: readonly RecordSpec[] = Object.freeze([HEADER, DETAIL, FOOTER]);

export function fieldsOf(spec: RecordSpec): readonly FieldSpec[] {
  return spec.fields;
}

export function findField(spec: RecordSpec, id: string): FieldSpec | undefined {
  return spec.fields.find(f => f.id === id);
}
