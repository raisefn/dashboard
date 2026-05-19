import type { Metadata } from "next";
import TrackerCTA from "@/components/tracker-cta";

// Default metadata for the /tracker section. Dynamic detail pages override
// this with entity-specific titles via their own generateMetadata.
export const metadata: Metadata = {
  title: "Tracker — Live Fundraising Intelligence | raise(fn)",
  description:
    "Live data from SEC Form D filings, 13F holdings, accelerator directories, and traction signals — cross-referenced and continuously updated. Find investors actually deploying capital.",
  openGraph: {
    title: "Tracker — Live Fundraising Intelligence | raise(fn)",
    description:
      "Live data from SEC Form D filings, 13F holdings, accelerator directories, and traction signals — cross-referenced and continuously updated.",
    type: "website",
    siteName: "raise(fn)",
  },
  twitter: {
    card: "summary",
    title: "Tracker — Live Fundraising Intelligence | raise(fn)",
    description:
      "Live data from SEC Form D filings, 13F holdings, and traction signals — find investors actually deploying capital.",
  },
};

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-6 pb-20">
        {children}
      </main>
      <TrackerCTA />
    </>
  );
}
