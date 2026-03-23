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

export const PRICE_MAP: Record<string, string | undefined> = {
  launchpad: process.env.STRIPE_LAUNCHPAD_PRICE_ID,
  catalyst: process.env.STRIPE_CATALYST_PRICE_ID,
  edge: process.env.STRIPE_EDGE_PRICE_ID,
};

export const TIER_FROM_PRICE: Record<string, string> = Object.fromEntries(
  Object.entries(PRICE_MAP)
    .filter(([, v]) => v)
    .map(([k, v]) => [v!, k])
);
