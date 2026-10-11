// "מקור: … · <what was checked, when>" beside a statutory number (TikTok note N8).
//
// A page that states a legal figure - the osek patur ceiling, the VAT rate, the
// allocation-number threshold - shows where it came from, from the same config
// the tool computes with, and says only what a record in the repository backs.
// A secondary source says it is secondary. `check` in the config names the
// record: {on, how, record, note}, where `how` is
//   "read"   - the cited page itself was read that day: "נבדק: <date>";
//   "search" - the figure was compared with search results that day, no cited
//              page opened: "הושווה לתוצאות חיפוש: <date>";
// and a config with no `check` says "תאריך הבדיקה לא תועד". tests/statutory-
// sources.test.js opens each record and requires the date and the figure in it
// (and, for "read", the cited address). A figure tied to a calendar year says so
// once that year is over, until someone checks the new year's figure and
// updates the config. Pure; the pages print the line statically.
//
// A config that cites documents instead of one `source` address (`documents` and
// `sourceLine`, as osek-zair.json and, since 11.10.2026, osek-patur.json do) gets
// the documents line: the documents by name, a third-party copy named with the
// site it is on ("(עותק באתר capitax.co.il)") - the site is the copy's host,
// never the source, and is not in SOURCES - and "נבדק: <date>", which only a
// dated read with a record may print (research/channel-loop/RULING-2026-10-11-
// osek-patur-ceiling.md, decision 2(5)).

/** Every source host a config may cite, with its Hebrew name and whether it is the authority itself. */
const SOURCES = [
  { host: 'kolzchut.org.il', name: 'כל זכות', primary: false },
  { host: 'ynet.co.il', name: 'ynet', primary: false },
  { host: 'grantthornton.co.il', name: 'Grant Thornton ישראל', primary: false },
  { host: 'gov.il', name: 'gov.il', primary: true },
];

/** The Hebrew name of a source address; throws for a host this module does not know. */
export function sourceNameHe(url) {
  const host = new URL(url).hostname.replace(/^www\./, '');
  const known = SOURCES.find((s) => host === s.host || host.endsWith(`.${s.host}`));
  if (!known) throw new Error(`no Hebrew name for the source ${host} - add it to src/lib/source-line.js`);
  return { name: known.name, primary: known.primary };
}

/** An ISO date (YYYY-MM-DD) as Israelis write it: 7.9.2026. */
export function dateHe(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ''));
  if (!m) throw new Error(`not an ISO date: ${iso}`);
  return `${Number(m[3])}.${Number(m[2])}.${m[1]}`;
}

const CHECK_HE = {
  read: (date) => `נבדק: ${date}`,
  search: (date) => `הושווה לתוצאות חיפוש: ${date}`,
};

/**
 * The documents line: "מקור: <documents> · נבדק: <date>". A document with `copyOn` is a third-party copy, and the
 * line names the site after the run of documents copied there; a document without it names itself (its name says
 * whose text it is). Only for a verified config with a dated read and a record.
 */
export function documentsSourceLineHe(config) {
  if (config?.verified !== true) throw new Error('only a verified config gets a source line');
  const check = config.check;
  if (check?.how !== 'read' || typeof check.record !== 'string' || !check.record.trim()) {
    throw new Error('a line that names documents needs a dated read with a record');
  }
  if (!Array.isArray(config.sourceLine) || !config.sourceLine.length) throw new Error('a documents line names at least one document');
  const groups = [];
  for (const id of config.sourceLine) {
    const doc = config.documents?.[id];
    if (!doc) throw new Error(`unknown document ${id}`);
    const last = groups[groups.length - 1];
    if (doc.copyOn && last?.copyOn === doc.copyOn) last.names.push(doc.he);
    else groups.push({ copyOn: doc.copyOn, names: [doc.he] });
  }
  const parts = groups.map(({ copyOn, names }) => {
    const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} ו${names[names.length - 1]}`;
    if (!copyOn) return list;
    return `${list} (${names.length === 1 ? 'עותק' : 'עותקים'} באתר ${copyOn})`;
  });
  return `מקור: ${parts.join('; ')} · ${CHECK_HE.read(dateHe(check.on))}`;
}

/**
 * The line: "מקור: <name>[ (מקור משני)] · <check>", or the documents line for a config that cites documents. Only
 * for a verified config; a figure nobody verified gets no line at all.
 */
export function sourceLineHe(config) {
  if (config?.verified !== true) throw new Error('only a verified config gets a source line');
  if (config.documents !== undefined || config.sourceLine !== undefined) return documentsSourceLineHe(config);
  const { name, primary } = sourceNameHe(config.source);
  const cited = `מקור: ${name}${primary ? '' : ' (מקור משני)'}`;
  const check = config.check;
  if (check === undefined) return `${cited} · תאריך הבדיקה לא תועד`;
  const say = CHECK_HE[check?.how];
  if (!say) throw new Error(`unknown kind of check: ${check?.how}`);
  if (typeof check.record !== 'string' || check.record.trim() === '') throw new Error('a check names the record that shows it');
  return `${cited} · ${say(dateHe(check.on))}`;
}

/** For a year-bound figure, the label once the calendar has passed its year; otherwise null. */
export function staleYearHe(config, today = new Date()) {
  if (typeof config?.year !== 'number') return null;
  const year = today.getFullYear();
  return year > config.year ? `הנתון לא עודכן עדיין לשנת ${year}` : null;
}
