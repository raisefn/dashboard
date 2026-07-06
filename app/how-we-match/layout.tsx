import type { Metadata } from "next";

// Metadata can't live on a client component, so the route uses a server
// layout to set the head. SEO target: "how investor matching works",
// "AI investor matching", "VC matching algorithm." Trust + transparency
// page for the matching architecture.
export const metadata: Metadata = {
  title: "How we match — raise(fn)",
  description:
    "Inside the matching architecture that surfaces the investors who actually write your check — sector, stage, check size, geography, deployment cadence, behavioral history. The agent runs every layer against your raise.",
  alternates: { canonical: "https://www.raisefn.com/how-we-match" },
  openGraph: {
    title: "How we match — raise(fn)",
    description:
      "Investor matching by sector, stage, check size, geography, and deployment cadence. Specialists outrank generalists. Hard nos honored. The agent runs the whole stack.",
    url: "https://www.raisefn.com/how-we-match",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How we match — raise(fn)",
    description:
      "The matching architecture explained. Sector, stage, check, geo, cadence, behavior — all layered by the agent.",
  },
};

export default function HowWeMatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
