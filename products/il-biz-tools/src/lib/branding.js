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
 * Apply branding to the document preview. With `enabled` false - no licence -
 * the preview renders unbranded, which is exactly what the free tier is.
 */
export function applyBranding(root, branding, enabled) {
  if (!root) return { applied: false };
  const normalized = normalizeBranding(branding);
  const logoEl = root.querySelector('[data-brand-logo]');
  const accentTarget = root.style ? root : null;

  if (!enabled) {
    if (logoEl) { logoEl.removeAttribute('src'); logoEl.hidden = true; }
    accentTarget?.style.removeProperty('--brand-accent');
    return { applied: false };
  }

  if (logoEl) {
    if (normalized.logo) { logoEl.src = normalized.logo; logoEl.hidden = false; }
    else { logoEl.removeAttribute('src'); logoEl.hidden = true; }
  }
  accentTarget?.style.setProperty('--brand-accent', normalized.accent);
  return { applied: true, accent: normalized.accent, hasLogo: Boolean(normalized.logo) };
}
