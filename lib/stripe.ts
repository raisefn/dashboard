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

// Single tier post-pricing-v2 (2026-05-25): Advisor at $999 one-time.
// STRIPE_LAUNCHPAD_PRICE_ID env var name preserved for backward compat
// — points to the new $999 one-time price ID, not the old $200/mo.
export function getPriceMap(): Record<string, string | undefined> {
  return {
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
