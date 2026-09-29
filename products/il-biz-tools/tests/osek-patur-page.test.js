// The osek-patur page script, loaded for real against a minimal fake DOM, with the clock set: the ceiling is set
// per calendar year, and once the year in src/config/osek-patur.json is over the page says so beside the source
// line (TikTok note N8). Review of 29.9.2026 (code 8): only staleYearHe itself was tested; deleting the line that
// shows the label passed every test.
import { describe, it, expect, vi, afterEach } from 'vitest';
import osekConfig from '../src/config/osek-patur.json' with { type: 'json' };

function makeEl(id) {
  const el = {
    id, hidden: id === '#ceiling-stale', textContent: '', value: '', className: '', style: {}, innerHTML: '',
    addEventListener() {},
    appendChild(x) { return x; },
    querySelector: () => makeEl(`${id} child`),
  };
  return el;
}

async function loadAt(date) {
  vi.resetModules();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(date);
  const els = new Map();
  const byId = (sel) => {
    if (!els.has(sel)) els.set(sel, makeEl(sel));
    return els.get(sel);
  };
  vi.doMock('../assets/common.js', () => ({ initPage: () => {}, $: byId, setMoney: () => {} }));
  const memory = new Map();
  vi.stubGlobal('localStorage', { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v) });
  vi.stubGlobal('document', { createElement: () => makeEl('created') });
  await import('../assets/page-osek-patur.js');
  return byId;
}

describe('osek-patur.html, the stale-year label', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.doUnmock('../assets/common.js');
  });

  it(`stays hidden and empty during ${osekConfig.year}`, async () => {
    const $ = await loadAt(new Date(osekConfig.year, 11, 31, 12));
    expect($('#ceiling-stale').hidden).toBe(true);
    expect($('#ceiling-stale').textContent).toBe('');
  });

  it(`shows once ${osekConfig.year} is over and nobody has updated the config`, async () => {
    const next = osekConfig.year + 1;
    const $ = await loadAt(new Date(next, 0, 2, 12));
    expect($('#ceiling-stale').hidden).toBe(false);
    expect($('#ceiling-stale').textContent).toBe(`הנתון לא עודכן עדיין לשנת ${next}`);
  });
});
