import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  _stripe = new Stripe(key);
  return _stripe;
}

// Pricing v3 (2026-06-10): three-tier SaaS model.
// - free: hard lifetime caps (no Stripe price)
// - pro: $199/mo recurring — STRIPE_PRO_PRICE_ID
// - advisor: $999 one-time + 3% success fee — STRIPE_LAUNCHPAD_PRICE_ID
//   (env var name preserved from v2 for backward compat).
export function getPriceMap(): Record<string, string | undefined> {
  return {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    advisor: process.env.STRIPE_LAUNCHPAD_PRICE_ID,
  };
}

export function getTierFromPrice(priceId: string): string | undefined {
  const map = getPriceMap();
  for (const [tier, id] of Object.entries(map)) {
    if (id === priceId) return tier;
  }
  return undefined;
}
