import TrackerCTA from "@/components/tracker-cta";

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
