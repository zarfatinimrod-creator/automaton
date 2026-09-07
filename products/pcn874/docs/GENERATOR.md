# The generator: a documented CSV in, a PCN874 file out

`pcn874 generate <input.csv> --out <file>` turns one row per document into the fixed-width file
described in [`SPEC.md`](SPEC.md). It is built on the validator and it **refuses to write a file the
validator rejects**: the generator builds the text, runs `validatePcn874` on it, and if that reports a
single `error` finding it prints the findings and writes nothing. `generatePcn874` returns
`text: null` in that case, and that is the only way any caller gets a file out of this package.

Two things it will not do, and they are the reason the product exists at all:

- **It does not compute `reportedVat`.** Appendix A defines the field — *"Total VAT to pay / receive
  for period   N(11)"* (`ita:…:126`), signed *"+ symbol to pay"* (`ita:…:125`) — and **states no
  arithmetic for it anywhere**: not in Appendix A, B or C, and not in either vendor manual
  ([`SPEC.md` §5.2](SPEC.md), [§6.7](SPEC.md)). You supply the figure; if you do not, the generator
  refuses and says exactly that.
- **It does not tell you the file will be taken by the Tax Authority.** It tells you the file matches
  the record layout in the Authority's circular. The Authority publishes a free simulator, and that is
  the thing that answers the other question:
  `http://www.misim.gov.il/EmDvhmfrt/wUploadFileHeshboniotSim.aspx`

---

## The input file

```
# licensedDealerId: 514457282
# reportMonth: 202601
# generationDate: 20260210
# reportedVat: 1800
entryType,counterpartyVatId,invoiceDate,refGroup,refNumber,vatSum,invoiceSum,allocationNumber,inputKind
S,512345678,20260112,0001,000000101,1800,10000,123456789,
```

A plain CSV (comma separated, `"` quoting with `""` for a literal quote, LF / CRLF / CR endings).
Before the column-header row it may carry a **header block** of `# name: value` lines. A `#` line whose
key is a single word is a directive; anything else — including a comment that happens to contain a
colon — is a comment and is ignored. A directive whose key is not one of the four below is refused
rather than dropped, so a typo cannot silently become a default.

Column names are matched ignoring case, spaces, hyphens and underscores: `entryType`, `Entry Type` and
`entry_type` are the same column. An **unknown** column name is refused.

### The header block

| directive | fills | `ita` line | notes |
|---|---|---:|---|
| `licensedDealerId` | header `licensedDealerId`, closing entry `licensedDealerId` | 101, 159-161 | **required.** Up to nine digits, zero-padded. The closing entry repeats it: Appendix A is headed *"Individual Merchant"* (`ita:…:91`), and where the two differ the validator warns — no line states they are equal ([`SPEC.md` §6.11](SPEC.md)). |
| `reportMonth` | header `reportMonth` | 102 | **required.** `YYYYMM` or `YYYY-MM`. |
| `generationDate` | header `generationDate` | 105 | `YYYYMMDD` or `YYYY-MM-DD`; defaults to today (UTC). The circular contradicts itself about this field's format — `N(8)` described as *"Yyyymm form"* — and this generator writes `YYYYMMDD`, the reading all three implementations write ([`SPEC.md` §5.1](SPEC.md)). |
| `reportedVat` | header `reportedVat`, `reportedVatSign` | 125, 126 | **required, and never computed.** Signed shekels: `+` is VAT to pay, `-` VAT to receive. `--reported-vat <shekels>` on the command line overrides it. |

### The columns

One row per document. Each column names the field of [`SPEC.md` §3.2](SPEC.md) it fills and the line of
the circular that defines that field.

| column | fills (`SPEC.md` §3.2) | `ita` line | required | what goes in it |
|---|---|---:|---|---|
| `entryType` | `recordType` `A(1)` | 133, 176-192 | yes | one of the eleven letters of the Table of Values: `S L M Y I` (sales), `T K R P H C` (inputs). Anything else is refused. |
| `counterpartyVatId` | `counterpartyVatId` `N(9)` | 134-137 | no | the other side's VAT id — the customer on a sale, the supplier on an input. Up to nine digits, zero-padded; empty means zeros. Appendix C **requires** zeros for `L` and `K` and **names a party** for `T M C P I` (and `H`, with a caveat), so leaving it empty on those is what makes the validator reject the file. |
| `invoiceDate` | `invoiceDate` `N(8)` | 138 | yes | `YYYYMMDD` or `YYYY-MM-DD`. A date that does not exist is refused. |
| `refGroup` | `refGroup` `A(4)` | 139, 580-581 | no | the reference group — *"Series etc."*, and it is `A(4)`, so **letters are legal**. Left-padded with zeros to four characters; empty means `0000`. More than four characters is refused. Anything outside `[A-Za-z0-9]` is written and warned about: the circular never says which characters an `A(n)` field admits ([`SPEC.md` §5.7](SPEC.md)). |
| `refNumber` | `refNumber` `N(9)` | 141 | no | digits; empty means zeros. More than nine digits keeps the **nine rightmost**, which is what the field is — *"First 9 positions from the right"* — and is reported as a warning so the cut is never silent. |
| `vatSum` | `totalVat` `N(9)` | 142-144 | no | the document's VAT **in shekels, signed**. The digits carry the absolute value; the sign goes in the record's single `+/-` field. |
| `invoiceSum` | `invoiceSum` `N(10)`, `invoiceSumSign` `A(1)` | 145-146, 148-149 | no | the document total **excluding VAT**, in shekels, signed — *"Always the 100%"*, so a partly deductible input still reports the whole total here while `vatSum` carries the allowed fraction. Negative means a cancellation or credit: *"Cancellation/credit from supplier or customer – always in minus"*. |
| `allocationNumber` | `allocationNumber` `N(9)` | 150-152, 583-584 | no | digits; empty means zeros, which is what the 2009 circular requires (*"At this stage, the value in this field will be zeros"*). A non-digit value is refused on the circular's own `N(9)`. More than nine digits keeps the nine rightmost, with a warning that says the only source for that rule is a **vendor manual** ([`SPEC.md` §6.2](SPEC.md)). |
| `inputKind` | *nothing in the record* | 118-119, 123 | no | `equipment` or `other` (the default). See below. |

There is **no column for a "date of value"**: Appendix A's transaction entry has nine fields
(`ita:…:127-152`) and none of them is one. Nothing is written to the file that the layout has no field
for.

#### Why `inputKind` exists

The header separates *"Total VAT on 'other' (non-capital) inputs"* (`ita:…:118-119`) from *"Total VAT
on 'equipment' inputs"* (`ita:…:123`), and **the transaction record has no field that says which a
document is** — the six input letters are all just "Input" in the Table of Values, and `SPEC.md` §6.4
settles that all six feed `inputsCount`. So the split has to come from the filer. This column is where
it comes from; it fills no field of any record, and it decides only which of the two header totals an
input's VAT joins. On a sales row it must be empty.

---

## What is computed, and from what

Everything the circular defines as a **sum or a count of the details** is computed from the details.
Nothing else is.

| header field | `ita` line | how it is computed |
|---|---:|---|
| `salesRecordCount` | 114-115, 181-185 | the number of records whose letter is `S L M Y I`. *"Number of sales records - both taxable and zero-rated/exempt"*. The validator checks this as an **error**, so it cannot silently drift. |
| `inputsCount` | 124, 186-191 | the number of records whose letter is `T K R P H C` — all six, per [`SPEC.md` §6.4](SPEC.md). Also an **error** rule in the validator. |
| `taxableSalesAmount` | 107 | the signed sum of `invoiceSum` over sales records whose VAT is **not** zeros. |
| `taxableSalesVat` | 109 | the signed sum of `vatSum` over those same records. |
| `zeroOrExemptSalesAmount` | 116-117 | the signed sum of `invoiceSum` over sales records whose VAT **is** zeros. |
| `otherInputsVat` | 118-119 | the signed sum of `vatSum` over input records not marked `equipment`. |
| `equipmentInputsVat` | 120-123 | the signed sum of `vatSum` over input records marked `equipment`. |
| `differentRateSalesAmount`, `differentRateSalesVat` | 110-113 | zeros, with `+` signs — *"Currently zeros – for future use"*, *"Currently '+'"*. Not computed and not settable. |
| `reportedVat`, `reportedVatSign` | 125, 126 | **taken from your input.** Never computed. |
| every `+/-` field | 174 | `-` when the total is negative, `+` otherwise — including for a total of exactly zero: *"In a '+/-' field: When the amount field is zero, the value of the '+/-' field will be '+'."* |

### Three readings this generator had to take

The circular defines these fields without spelling out every case. Where it stops, this file says so
rather than presenting a choice as the Authority's.

1. **Taxable versus zero-rated is decided by the VAT being zeros.** A taxable sale and a zero-rated one
   share the same letter; Appendix C tells them apart by the VAT sum cell — the row *"Zero
   Value/Exempt 'SL' – not export"* has `Zeros` there (`ita:…:271-283`), and `SPEC.md` §6.10 records
   that reading. So a sale row with `vatSum` 0 feeds `zeroOrExemptSalesAmount`, and one with a VAT
   feeds `taxableSalesAmount` and `taxableSalesVat`.
2. **A credit subtracts.** The amendment procedure says the incorrect invoice *"will be cancelled –
   reported as an opposite sign"* (`ita:…:590-594`), which only leaves the period's totals right if the
   signed amount is what enters them. So a row with negative amounts subtracts from both its total and
   its VAT total.
3. **An export (`Y`) is counted as a zero-value sale.** Its VAT is zeros by Appendix C (`ita:…:564`)
   and the header field names *"zero value and exempt sales"* without excluding exports — but Appendix
   C's zero-rated *sale* row is headed *"not export"*, so the two could be read apart. **No rendered
   line settles it.** The generator prints a warning whenever the file contains a `Y` record, naming
   the reading it took. If the Authority reads it the other way, this is the total that moves.

### Rounding

The circular says an amount is *"Rounded to the nearest shekel"* — for the VAT sum (`ita:…:142-144`)
and for the invoice total (`ita:…:148-149`), *"always a positive value"* in both. This generator reads
shekels with optional agorot and rounds to the nearest whole shekel; the digits carry the absolute
value and the sign is a separate character, as Appendix A lays out.

**What the circular does not say is which way exactly half a shekel goes**, and neither vendor manual
says either. This generator rounds a half **away from zero**. That is a **product choice, not a rule of
the circular**, it is never presented as one, and it is reported as a warning on the row where it
actually decided a digit. Everything else about rounding is the circular's.

Totals are summed from the **rounded** per-record amounts. The nearest thing to authority for that is
the H-ERP manual, a vendor document, which says the Authority requires each entry to be rounded before
the totals are summed and that the resulting difference from the unrounded books *"should not prevent
transmitting the file"* (`herp:…:1185-1190`, quoted in [`SPEC.md` §5.2](SPEC.md)). It is recorded here
as a vendor-sourced fact, not as the Authority's rule.

### Line endings

Records are joined with `LF` and the file ends without a trailing newline. **The circular states no
record separator at all** ([`SPEC.md` §5.3](SPEC.md)); the validator accepts LF, CRLF and CR, and warns
only when one file mixes them. This is the shape this generator writes, not a shape it claims is
required.

---

## Refusals and warnings

The generator uses the same two-level ladder as the validator, for the same reason: a file that is
wrong is the filer's exposure, and a file refused for a rule nobody stated is a defect too.

**An error refuses the file** — nothing is written and the exit code is `1`. There are two kinds:

- **Input errors**, before a file is built: a missing or unreadable `reportedVat`, an unknown column or
  directive, a missing required column, an entry-type letter outside the eleven, a date that is not a
  date, an amount that is not an amount, an amount too wide for the field Appendix A declares (refused
  rather than truncated), a row whose VAT and invoice total disagree about the record's **one** `+/-`
  field, a non-digit allocation number.
- **Validator errors**, after a file is built: whatever `validatePcn874` reports as an `error`. The
  common one is a counter party Appendix C requires — a `T` input or an `M` self-invoice with a zeros
  supplier is refused by `detail.T.counterpartyExpected` / `detail.M.counterpartyExpected`, and an
  identified sale above ₪5,000 with no customer number by `detail.S.counterpartyExpected`.

**A warning is printed and the file is written**, exit code `0`: a half-shekel rounding tie, a
reference or allocation number cut to its nine rightmost digits, an export counted as a zero-value
sale, and every warning the validator raises about the produced file (a punctuation character in the
reference group, a period with no transactions, petty cash over note E's cap, and the rest).

---

## Use

```bash
pcn874 generate documents.csv --out PCN874.TXT --reported-vat 1800
pcn874 validate PCN874.TXT
```

```
pcn874 generate <input.csv> --out <file> [--reported-vat <shekels>] [--json]
```

Exit `0` when the file was written, `1` when the generator refused, `2` on a usage or I/O problem.
`--json` prints the problems and the validator's findings as JSON instead of the human report.

### As a library

```ts
import { generatePcn874 } from './src/index.js';

const result = generatePcn874(csvText, { reportedVat: '1800' });
if (!result.ok) {
  for (const p of result.problems) console.error(p.severity, p.code, p.message);
  for (const f of result.validation?.findings ?? []) console.error(f.severity, f.rule, f.message);
} else {
  writeFileSync('PCN874.TXT', result.text!, 'utf8');
}
```

`result.text` is `null` whenever `result.ok` is false, and `ok` is false whenever the generator's own
`validatePcn874` run reported an error. `result.problems` are about the **input**;
`result.validation.findings` are about the **output**.

### The sample inputs

`tests/fixtures/csv/*.csv` are eight generated sample inputs — `minimal`, `mixed`, `equipment`,
`rounding`, `sign-of-zero`, `warnings`, and the two that must be refused, `no-reported-vat` and
`input-no-supplier`. They are produced by `scripts/make-csv-fixtures.mjs` from the same column list the
code uses, so nothing is hand-typed; every digit in them is invented. `minimal.csv` is built to
reproduce `tests/fixtures/valid-minimal.txt` byte for byte, and a test asserts it.

`mixed.csv` reproduces `tests/fixtures/valid-mixed.txt` in every transaction record and in the closing
entry, and in the header everywhere but one field: the fixture's `taxableSalesAmount` is ₪9,000 and the
computed total is ₪11,000, because the fixture leaves out the `L` record's ₪2,000 — a taxable sale, its
VAT being 360. The fixture's header amounts were invented for the validator, which cross-checks **no
amount at all** ([`SPEC.md` §5.2](SPEC.md)), so the fixture is not authority for the arithmetic. The
test asserts the difference explicitly rather than hiding it.
