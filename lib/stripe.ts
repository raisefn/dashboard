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

// Pricing v5 (2026-07-01): Advisor restructured from 3-month concierge to
// month-1 setup + guidance, then Pro ongoing.
// - free: hard lifetime caps (no Stripe price)
// - pro: $199/mo recurring — STRIPE_PRO_PRICE_ID
// - advisor: $1,997 day-1 checkout = $199 first-month Pro + $1,798 setup fee.
//   Mixed-mode Stripe Checkout Session:
//     line 1: Pro monthly subscription (bills $199 immediately, renews day 31)
//     line 2: Advisor Setup Fee (one-time $1,798)
//   Total today: $1,997. Ongoing: $199/mo Pro, cancel anytime.
//
// Env vars:
//   STRIPE_PRO_PRICE_ID          — $199/mo recurring
//   STRIPE_ADVISOR_SETUP_PRICE_ID — $1,798 one-time
//
// Legacy (grandfathered — Matt/Taylor/Ralph/Alfredo paid under v4):
//   STRIPE_ADVISOR_MONTHLY_PRICE_ID ($999/mo × 3 concierge)
//   STRIPE_ADVISOR_UPFRONT_PRICE_ID ($1,999 upfront concierge)
// These prices should be ARCHIVED in Stripe Dashboard so no new
// customer can hit them, but their tier='advisor' status persists via
// webhook (see getTierFromPrice below).
export function getPriceMap(): Record<string, string | undefined> {
  return {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    advisor_setup: process.env.STRIPE_ADVISOR_SETUP_PRICE_ID,
    // Grandfathered v4 prices — still recognized by webhooks, not offered
    // for new checkouts.
    advisor_monthly_legacy: process.env.STRIPE_ADVISOR_MONTHLY_PRICE_ID,
    advisor_upfront_legacy: process.env.STRIPE_ADVISOR_UPFRONT_PRICE_ID,
  };
}

/** Returns the line_items array for a Stripe Checkout Session.
 *  Pro: single subscription line. Advisor: mixed subscription + one-time. */
export function getCheckoutLineItems(tier: string): { price: string; quantity: number }[] | undefined {
  const map = getPriceMap();
  if (tier === "pro") {
    if (!map.pro) return undefined;
    return [{ price: map.pro, quantity: 1 }];
  }
  if (tier === "advisor") {
    if (!map.pro || !map.advisor_setup) return undefined;
    return [
      { price: map.pro, quantity: 1 },
      { price: map.advisor_setup, quantity: 1 },
    ];
  }
  return undefined;
}

export function getTierFromPrice(priceId: string): string | undefined {
  const map = getPriceMap();
  if (priceId === map.pro) return "pro";
  if (priceId === map.advisor_setup) return "advisor";
  // Grandfathered v4 recognition — legacy customers keep advisor tier.
  if (priceId === map.advisor_monthly_legacy || priceId === map.advisor_upfront_legacy) {
    return "advisor";
  }
  return undefined;
}
