/**
 * Paddle Billing overlay checkout ("Pro" gate).
 * Docs: https://developer.paddle.com/paddlejs/overview
 */
export const PADDLE_JS_URL = 'https://cdn.paddle.com/paddle/v2/paddle.js';

export function isProConfigured(cfg) {
  const p = cfg?.paddle ?? {};
  return Boolean(p.clientToken && p.priceId);
}

/** Options passed to Paddle.Checkout.open(). Kept pure so it can be tested. */
export function buildCheckoutOptions(cfg, { email, successUrl } = {}) {
  const p = cfg.paddle;
  const opts = {
    items: [{ priceId: p.priceId, quantity: 1 }],
    settings: { displayMode: 'overlay', locale: 'he', theme: 'light' },
  };
  if (email) opts.customer = { email };
  if (successUrl) opts.settings.successUrl = successUrl;
  return opts;
}

/** Load paddle.js once and initialise it. Resolves with the global Paddle object. */
export function loadPaddle(cfg, doc = globalThis.document, win = globalThis) {
  if (!isProConfigured(cfg)) return Promise.reject(new Error('Paddle is not configured'));
  if (win.Paddle?.Initialized) return Promise.resolve(win.Paddle);
  return new Promise((resolve, reject) => {
    const s = doc.createElement('script');
    s.src = PADDLE_JS_URL;
    s.async = true;
    s.onload = () => {
      try {
        if (cfg.paddle.environment === 'sandbox') win.Paddle.Environment.set('sandbox');
        win.Paddle.Initialize({ token: cfg.paddle.clientToken });
        resolve(win.Paddle);
      } catch (e) { reject(e); }
    };
    s.onerror = () => reject(new Error('Failed to load paddle.js'));
    doc.head.appendChild(s);
  });
}

export async function openProCheckout(cfg, extra = {}) {
  const Paddle = await loadPaddle(cfg);
  Paddle.Checkout.open(buildCheckoutOptions(cfg, extra));
}
