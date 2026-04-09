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

export function getPriceMap(): Record<string, string | undefined> {
  return {
    launchpad: process.env.STRIPE_LAUNCHPAD_PRICE_ID,
    launchpad_annual: process.env.STRIPE_LAUNCHPAD_ANNUAL_PRICE_ID,
    catalyst: process.env.STRIPE_CATALYST_PRICE_ID,
  };
}

export function getTierFromPrice(priceId: string): string | undefined {
  const map = getPriceMap();
  for (const [tier, id] of Object.entries(map)) {
    if (id === priceId) return tier;
  }
  return undefined;
}
