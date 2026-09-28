// Which revenue line a page's views count toward.
//
// The site has one page-view counter: PostHog, cookieless, off until
// src/config/site.json carries a project key (src/lib/analytics.js, installed
// by initPage() in assets/common.js on every page). It records views per URL,
// so no page needs its own instrument; what a weekly reader needs is this
// mapping from the page to the line whose KPI the views are. Both lines list
// "weekly page views (cookieless)" among their KPIs in src/revenue/portfolio.ts,
// and pcn874's kill rule reads it ("weekly page views under 100 for 8
// consecutive weeks after publication").
//
// pcn874.html is the free validator for the pcn874 line (BOARD-LOOP rank 4); it
// rides this site's deploy, but its views are that line's evidence, not
// il-biz-tools'. Every other page counts for il-biz-tools.
//
// Build-time/reporting only. No shipped page imports this module.

export const DEFAULT_KPI_LINE = 'il-biz-tools';

export const PAGE_KPI_LINES = Object.freeze({
  'pcn874.html': 'pcn874',
});

/** The revenue line (src/revenue/portfolio.ts id) a page's views count toward. */
export function kpiLineOf(page) {
  return Object.prototype.hasOwnProperty.call(PAGE_KPI_LINES, page) ? PAGE_KPI_LINES[page] : DEFAULT_KPI_LINE;
}
