import type { Metadata } from "next";
import TrackerCTA from "@/components/tracker-cta";

// Default metadata for the /tracker section. Dynamic detail pages override
// this with entity-specific titles via their own generateMetadata.
//
// openGraph.images + twitter.images explicitly reference the section OG
// image (app/tracker/opengraph-image.tsx). Next.js deep-merges metadata
// from parent layouts into child pages, so child page.tsx files that
// override openGraph/twitter title+description still inherit these
// images. Card type "summary_large_image" renders the big-image variant
// on Twitter rather than the small text-only card.
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
    images: ["/tracker/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tracker — Live Fundraising Intelligence | raise(fn)",
    description:
      "Live data from SEC Form D filings, 13F holdings, and traction signals — find investors actually deploying capital.",
    images: ["/tracker/opengraph-image"],
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
