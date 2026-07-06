import type { Metadata } from "next";

// Counterpart to /how-we-match — together they form the trust narrative
// for how the agent gets sharper over time.
export const metadata: Metadata = {
  title: "How we learn — raise(fn)",
  description:
    "Every raise teaches the next one. The agent captures what worked, what didn't, and what changed — across founder outreach, investor behavior, meeting outcomes, and terms — then runs the next raise sharper for it.",
  alternates: { canonical: "https://www.raisefn.com/how-we-learn" },
  openGraph: {
    title: "How we learn — raise(fn)",
    description:
      "The feedback loops that sharpen every raise — outreach, meeting outcomes, term sheet patterns, network signal.",
    url: "https://www.raisefn.com/how-we-learn",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How we learn — raise(fn)",
    description:
      "Every raise teaches the next one. The feedback loops that keep the agent sharp.",
  },
};

export default function HowWeLearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
