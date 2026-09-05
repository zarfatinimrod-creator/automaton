/**
 * Optional, privacy-friendly analytics. Off unless site.json sets provider to
 * "plausible" or "posthog" with the matching credentials.
 */
export function buildAnalyticsSnippet(cfg) {
  const a = cfg?.analytics ?? {};
  if (a.provider === 'plausible' && a.plausibleDomain) {
    return { provider: 'plausible', src: 'https://plausible.io/js/script.js', attrs: { defer: '', 'data-domain': a.plausibleDomain } };
  }
  if (a.provider === 'posthog' && a.posthogKey) {
    const host = a.posthogHost || 'https://eu.i.posthog.com';
    return {
      provider: 'posthog',
      inline: `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init(${JSON.stringify(a.posthogKey)},{api_host:${JSON.stringify(host)},person_profiles:'identified_only'});`,
    };
  }
  return null;
}

export function installAnalytics(cfg, doc = globalThis.document) {
  const snippet = buildAnalyticsSnippet(cfg);
  if (!snippet || !doc) return false;
  const s = doc.createElement('script');
  if (snippet.src) {
    s.src = snippet.src;
    for (const [k, v] of Object.entries(snippet.attrs ?? {})) s.setAttribute(k, v);
  } else {
    s.textContent = snippet.inline;
  }
  doc.head.appendChild(s);
  return true;
}
