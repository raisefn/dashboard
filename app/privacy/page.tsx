import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | raise(fn)",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <header className="border-b border-zinc-800/50">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold">
            <span className="text-orange-500">raise</span>
            <span className="text-teal-400">(fn)</span>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-12">Plain English. No legalese.</p>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What we collect
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>Account info (name, email, company, role)</li>
            <li>Conversations with the brain</li>
            <li>Fundraising data you share (pipeline status, investor interactions, meeting notes, terms)</li>
            <li>Basic usage data</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            How we use it
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              To power your raisefn experience &mdash; investor matching, pipeline
              recall, readiness benchmarking, and everything the brain does for you
            </li>
            <li>To improve the product through aggregate insights (never individual data)</li>
            <li>We do not sell your data</li>
            <li>We do not share your data with third parties</li>
            <li>Your data is not used to train AI models</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Who can see your data
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>You</li>
            <li>raisefn team (for support and concierge service)</li>
            <li>
              When we facilitate matches between founders and investors, we share
              relevant company and investment details to enable introductions.
              Private conversations, meeting notes, and pipeline status are never
              shared with other users.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Where your data lives
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>United States</li>
            <li>Encrypted in transit</li>
            <li>Access controlled and authenticated</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Your rights
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>Request a copy of your data at any time</li>
            <li>Request deletion at any time</li>
            <li>
              Questions:{" "}
              <a
                href="mailto:privacy@raisefn.com"
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                privacy@raisefn.com
              </a>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
