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

// Pricing v4 (2026-06-11): two paid tiers, three checkout flows.
// - free: hard lifetime caps (no Stripe price)
// - pro: $199/mo recurring — STRIPE_PRO_PRICE_ID
// - advisor (monthly): $999/mo recurring — STRIPE_ADVISOR_MONTHLY_PRICE_ID
// - advisor (upfront): $1,999 one-time — STRIPE_ADVISOR_UPFRONT_PRICE_ID
//
// Engagement letter is at /legal/engagement. NO success fee, NO equity, NO
// transaction-based comp anywhere. Engagement letter acceptance captured
// natively on Stripe's hosted page via consent_collection.terms_of_service.
//
// Legacy env var STRIPE_LAUNCHPAD_PRICE_ID (v2/v3 $999 one-time Advisor +
// 3% success fee) should be archived in Stripe Dashboard; the code no
// longer reads it. Existing v3 Advisor customers stay grandfathered under
// v3 terms — no code path migrates them.
export type AdvisorBilling = "monthly" | "upfront";

export function getPriceMap(): Record<string, string | undefined> {
  return {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    advisor_monthly: process.env.STRIPE_ADVISOR_MONTHLY_PRICE_ID,
    advisor_upfront: process.env.STRIPE_ADVISOR_UPFRONT_PRICE_ID,
  };
}

export function getPriceIdFor(tier: string, billing?: AdvisorBilling): string | undefined {
  const map = getPriceMap();
  if (tier === "pro") return map.pro;
  if (tier === "advisor") {
    return billing === "upfront" ? map.advisor_upfront : map.advisor_monthly;
  }
  return undefined;
}

export function getTierFromPrice(priceId: string): string | undefined {
  const map = getPriceMap();
  if (priceId === map.pro) return "pro";
  if (priceId === map.advisor_monthly || priceId === map.advisor_upfront) return "advisor";
  return undefined;
}
