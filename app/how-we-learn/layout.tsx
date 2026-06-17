import type { Metadata } from "next";

// SEO target: "how does fundraising platform learn", "AI matching feedback loop",
// "investor intelligence flywheel." Counterpart to /how-we-match — together
// they form the trust narrative for the matching product.
export const metadata: Metadata = {
  title: "How we learn — raise(fn)",
  description:
    "Every raise teaches the next one. Twenty-two feedback loops across founder artifacts, investor behavior, cohort benchmarks, matching intelligence, and outcome data — all working to make the next match sharper than the last.",
  alternates: { canonical: "https://www.raisefn.com/how-we-learn" },
  openGraph: {
    title: "How we learn — raise(fn)",
    description:
      "Five categories of feedback loops powering the matching flywheel — founder artifact learning, investor behavioral intelligence, cohort benchmarks, matching signal, and outcome closed-loop.",
    url: "https://www.raisefn.com/how-we-learn",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How we learn — raise(fn)",
    description:
      "Twenty-two learning loops. Every raise sharpens the system for the next one.",
  },
};

export default function HowWeLearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
