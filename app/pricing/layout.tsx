import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — raise(fn)",
  description:
    "Three tiers built for founders raising. Free to try (limited). Pro at $199/mo, uncapped, cancel anytime. Advisor at $999 + 3% success fee, with raise(fn) Team brokering warm intros to portfolio-fit investors. Built for founders, transparent on the success fee.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — raise(fn)",
    description:
      "Free · Pro $199/mo · Advisor $999 once + 3% success fee. Three tiers, no surprises.",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
