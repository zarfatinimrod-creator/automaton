/**
 * Optional, privacy-friendly measurement. Off unless site.json says otherwise,
 * and off is the shipped default: no key, no snippet, no third-party request.
 *
 * Two independent providers, because they answer different questions:
 *  - Plausible (`analytics.provider`), unchanged.
 *  - PostHog (`posthog.projectKey`), configured COOKIELESS. This is the one the
 *    board asked for: it exists to count page views so the registrar page can
 *    be judged against its 100-weekly-views gate, and for nothing else.
 *
 * The PostHog options are not guessed. Each is named in PostHog's own docs
 * (retrieved 2026-09-07 through the PostHog docs tool):
 *   cookieless_mode: 'always'      https://posthog.com/tutorials/cookieless-tracking
 *   persistence: 'memory'          https://posthog.com/docs/libraries/js/persistence
 *   autocapture / capture_pageview / disable_session_recording
 *                                  https://posthog.com/docs/libraries/js/config
 * `cookieless_mode: 'always'` means PostHog never stores anything in cookies or
 * in local/session storage; `persistence: 'memory'` says the same thing from
 * the other side and is kept as a belt-and-braces default for older SDK builds.
 * PostHog's docs add one owner-side prerequisite: "Cookieless server hash mode"
 * must be enabled in the project's web-analytics settings.
 */

export function buildPlausibleSnippet(cfg) {
  const a = cfg?.analytics ?? {};
  if (a.provider !== 'plausible' || !a.plausibleDomain) return null;
  return {
    provider: 'plausible',
    src: 'https://plausible.io/js/script.js',
    attrs: { defer: '', 'data-domain': a.plausibleDomain },
  };
}

export function buildPostHogSnippet(cfg) {
  const p = cfg?.posthog ?? {};
  if (!p.projectKey) return null;
  const host = p.apiHost || 'https://eu.i.posthog.com';
  const options = {
    api_host: host,
    cookieless_mode: 'always',
    persistence: 'memory',
    autocapture: false,
    capture_pageview: true,
    disable_session_recording: true,
  };
  return {
    provider: 'posthog',
    inline:
      `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);` +
      `posthog.init(${JSON.stringify(p.projectKey)},${JSON.stringify(options)});`,
  };
}

/** Every snippet this configuration asks for, in install order. */
export function buildAnalyticsSnippets(cfg) {
  return [buildPlausibleSnippet(cfg), buildPostHogSnippet(cfg)].filter(Boolean);
}

/** Back-compat single-snippet helper: the first snippet, or null when measurement is off. */
export function buildAnalyticsSnippet(cfg) {
  return buildAnalyticsSnippets(cfg)[0] ?? null;
}

/** @returns {boolean} whether anything was installed. */
export function installAnalytics(cfg, doc = globalThis.document) {
  const snippets = buildAnalyticsSnippets(cfg);
  if (!snippets.length || !doc) return false;
  for (const snippet of snippets) {
    const s = doc.createElement('script');
    if (snippet.src) {
      s.src = snippet.src;
      for (const [k, v] of Object.entries(snippet.attrs ?? {})) s.setAttribute(k, v);
    } else {
      s.textContent = snippet.inline;
    }
    doc.head.appendChild(s);
  }
  return true;
}
