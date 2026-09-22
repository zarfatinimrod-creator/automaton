import site from '../src/config/site.json' with { type: 'json' };
import { installAnalytics } from '../src/lib/analytics.js';
import { formatILS } from '../src/lib/money.js';

export { site, formatILS };

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Mark current nav link, set canonical from site.json, install optional analytics. */
export function initPage() {
  const path = location.pathname.split('/').pop() || 'index.html';
  $$('nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path || (path === 'index.html' && href === './')) a.setAttribute('aria-current', 'page');
  });
  const canonical = $('link[rel=canonical]');
  if (canonical && site.siteUrl) {
    const file = path === 'index.html' ? '' : path;
    canonical.href = `${site.siteUrl.replace(/\/$/, '')}/${file}`;
  }
  installAnalytics(site);
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
}

/** Display a shekel amount inside an element (LTR-isolated). */
export function setMoney(el, value, decimals = 2) {
  if (!el) return;
  el.textContent = formatILS(value, { decimals });
}

/** Debounce for input handlers. */
export function debounce(fn, ms = 120) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
