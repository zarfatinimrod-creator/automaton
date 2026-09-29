// "מקור: … · נבדק: …" beside a statutory number (TikTok note N8).
//
// A page that states a legal figure - the osek patur ceiling, the VAT rate -
// shows where it came from and when it was last checked, from the same config
// the tool computes with. A secondary source says it is secondary. A figure tied
// to a calendar year says so once that year is over, until someone checks the
// new year's figure and updates the config. Pure; the pages print the line
// statically and tests/statutory-sources.test.js holds them to this module.

/** Every source host a config may cite, with its Hebrew name and whether it is the authority itself. */
const SOURCES = [
  { host: 'kolzchut.org.il', name: 'כל זכות', primary: false },
  { host: 'ynet.co.il', name: 'ynet', primary: false },
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

/**
 * The line: "מקור: <name>[ (מקור משני)] · נבדק: <date>". Only for a verified
 * config with a check date - a figure nobody checked gets no "checked" line.
 */
export function sourceLineHe(config) {
  if (config?.verified !== true) throw new Error('only a verified config gets a source line');
  if (!config.checkedOn) throw new Error('the config has no checkedOn date');
  const { name, primary } = sourceNameHe(config.source);
  return `מקור: ${name}${primary ? '' : ' (מקור משני)'} · נבדק: ${dateHe(config.checkedOn)}`;
}

/** For a year-bound figure, the label once the calendar has passed its year; otherwise null. */
export function staleYearHe(config, today = new Date()) {
  if (typeof config?.year !== 'number') return null;
  const year = today.getFullYear();
  return year > config.year ? `הנתון לא עודכן עדיין לשנת ${year}` : null;
}
