import type { Metadata } from "next";

// Metadata can't live on a client component, so the route uses a server
// layout to set the head. SEO target: "how investor matching works",
// "AI investor matching", "VC matching algorithm." Trust + transparency
// page that backlinks to /founders, /investors, /signup.
export const metadata: Metadata = {
  title: "How we match — raise(fn)",
  description:
    "Five dimensions, specialty signal, hard-no honored, human curation. Inside the investor matching architecture that surfaces eight investors who actually write your check — not eight hundred keyword matches.",
  alternates: { canonical: "https://www.raisefn.com/how-we-match" },
  openGraph: {
    title: "How we match — raise(fn)",
    description:
      "Investor matching across five dimensions — industry, modality, technology, audience, business model. Specialists outrank generalists. Hard nos honored. Every warm intro brokered by a human.",
    url: "https://www.raisefn.com/how-we-match",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How we match — raise(fn)",
    description:
      "Five dimensions, specialty-weighted, hard-no honored, human-brokered. The matching architecture explained.",
  },
};

export default function HowWeMatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
