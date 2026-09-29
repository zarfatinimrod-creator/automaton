// The Pro feature: branding a printed document with the business's own logo and
// accent colour.
//
// This is the only thing Pro sells. The saved client list and per-document-type
// numbering are free and stay free - charging for them would be charging for
// something the buyer already has.

export const DEFAULT_ACCENT = '#1f3a5f';
export const MAX_LOGO_BYTES = 512 * 1024;

const HEX = /^#[0-9a-fA-F]{6}$/;

export function isValidAccent(color) {
  return typeof color === 'string' && HEX.test(color);
}

/** Reject anything that is not a reasonably sized inline image. */
export function isValidLogo(dataUrl) {
  if (typeof dataUrl !== 'string') return false;
  if (!/^data:image\/(png|jpeg|webp|svg\+xml);base64,/.test(dataUrl)) return false;
  return dataUrl.length <= MAX_LOGO_BYTES;
}

export function emptyBranding() {
  return { logo: null, accent: DEFAULT_ACCENT };
}

/** Drop anything invalid rather than letting it reach the DOM. */
export function normalizeBranding(input) {
  const branding = emptyBranding();
  if (!input || typeof input !== 'object') return branding;
  if (isValidLogo(input.logo)) branding.logo = input.logo;
  if (isValidAccent(input.accent)) branding.accent = input.accent;
  return branding;
}

/**
 * Apply branding to the document preview, in one of three modes:
 *
 *   'off'   - no licence and nothing to try: the preview renders unbranded,
 *             which is exactly what the free tier is.
 *   'trial' - the shop is open and there is no licence: the logo and colour
 *             show on the ON-SCREEN preview so the buyer sees what Pro does
 *             before paying. The accent goes into --brand-trial-accent, which
 *             only an `@media screen` rule reads, and the root carries
 *             data-brand-trial, under which the print stylesheet hides the
 *             logo. Printing or saving a PDF gives the free document, unchanged
 *             and unmarked (research/tiktok/08-sales-marketing-lessons.md N2).
 *   'pro'   - an active licence: logo and --brand-accent, on screen and paper.
 *
 * `true` and `false` still mean 'pro' and 'off'.
 */
export function applyBranding(root, branding, mode) {
  const m = mode === true ? 'pro' : mode === 'trial' || mode === 'pro' ? mode : 'off';
  if (!root) return { applied: false, mode: m };
  const normalized = normalizeBranding(branding);
  const logoEl = root.querySelector('[data-brand-logo]');
  const style = root.style ?? null;

  style?.removeProperty('--brand-accent');
  style?.removeProperty('--brand-trial-accent');
  root.removeAttribute?.('data-brand-trial');

  if (m === 'off') {
    if (logoEl) { logoEl.removeAttribute('src'); logoEl.hidden = true; }
    return { applied: false, mode: m };
  }

  if (logoEl) {
    if (normalized.logo) { logoEl.src = normalized.logo; logoEl.hidden = false; }
    else { logoEl.removeAttribute('src'); logoEl.hidden = true; }
  }
  if (m === 'trial') {
    root.setAttribute?.('data-brand-trial', '');
    style?.setProperty('--brand-trial-accent', normalized.accent);
  } else {
    style?.setProperty('--brand-accent', normalized.accent);
  }
  return { applied: true, mode: m, accent: normalized.accent, hasLogo: Boolean(normalized.logo) };
}
