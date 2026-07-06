import type { Metadata } from "next";

// Per-page metadata for the raise-fund audience: venture GPs raising a
// fund, real estate developers raising for a deal, angel syndicate
// leads scaling to $1-5M SPVs, and other capital raisers.
// Lives in a layout because the page itself is "use client" (FadeInSection).
export const metadata: Metadata = {
  title: "Raise a fund with an AI agent — raise(fn)",
  description:
    "The AI agent for your fund raise. Target the right LPs, draft the outreach, prep the meeting, track the round, close the fund. Built for venture GPs, real estate deal sponsors, and syndicate leads raising capital.",
  alternates: { canonical: "/raise-fund" },
  openGraph: {
    title: "Raise a fund with an AI agent — raise(fn)",
    description:
      "The AI agent that runs your fund raise alongside you. Target LPs, draft outreach, prep meetings, track pipeline.",
    type: "website",
  },
};

export default function RaiseFundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
