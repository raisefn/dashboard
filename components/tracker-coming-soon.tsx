import Link from "next/link";

export default function TrackerComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
        Coming soon
      </p>
      <h2 className="text-2xl font-bold text-white mb-3">
        The tracker is being built.
      </h2>
      <p className="text-sm text-zinc-500 max-w-md mb-8">
        Live data from SEC filings, accelerator directories, investor registries,
        and traction signals — cross-referenced and continuously updated.
      </p>
      <Link
        href="/tracker"
        className="rounded-full border border-teal-700/50 bg-teal-950/20 px-6 py-2.5 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30"
      >
        Back to the Tracker
      </Link>
    </div>
  );
}
