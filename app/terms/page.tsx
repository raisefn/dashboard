import Link from "next/link";

export const metadata = {
  title: "Terms of Service | raise(fn)",
};

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-zinc-500 mb-12">Plain English. No legalese.</p>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What raisefn is
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              The AI agent for your raise &mdash; sourcing, per-investor briefs,
              meeting prep, outreach, pipeline tracking, and everything else
              running a raise needs
            </li>
            <li>
              Built for anyone raising capital &mdash; founders raising for their
              company, investors raising a fund, deal, or SPV, and developers
              building on top of the agent
            </li>
            <li>You can use it free, or pay for Pro to unlock the full agent</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Your account
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>You must provide accurate information when signing up</li>
            <li>You&rsquo;re responsible for keeping your account secure</li>
            <li>One person per account &mdash; don&rsquo;t share login credentials</li>
            <li>You must be 18 or older to use raisefn</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            How you use it
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>Use raisefn for legitimate fundraising activities only</li>
            <li>
              Don&rsquo;t misrepresent your company, traction, or background &mdash;
              accuracy is the foundation of everything we do
            </li>
            <li>Don&rsquo;t scrape, copy, or resell data from the platform</li>
            <li>Don&rsquo;t use raisefn to spam, harass, or mislead investors or other users</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Your conversations
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              raisefn is your working environment. Investors and LPs you engage
              with are never exposed to the platform &mdash; your conversations
              stay confidential
            </li>
            <li>
              We don&rsquo;t guarantee meetings, term sheets, or funding outcomes
              &mdash; raisefn is a tool, not a placement agent or broker-dealer
            </li>
            <li>
              You&rsquo;re responsible for your conversations with investors and
              LPs &mdash; what you share, how you represent yourself, and any
              commitments you make
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Payments
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <strong className="text-zinc-100">Founder</strong> is $199/month
              or $999/year via Stripe &mdash; cancel anytime, access
              continues through end of billing period
            </li>
            <li>
              <strong className="text-zinc-100">Investor</strong> is $399/month
              or $1,999/year via Stripe &mdash; cancel anytime, access
              continues through end of billing period
            </li>
            <li><strong className="text-zinc-100">All purchases final.</strong> Funds paid are funds paid.</li>
            <li>You can stop future charges anytime from your account or by emailing team@raisefn.com. Past charges are non-refundable.</li>
            <li>Disputes or chargebacks: email team@raisefn.com before opening a dispute</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What we don&rsquo;t promise
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>raisefn is provided &ldquo;as is&rdquo; &mdash; we do our best, but the platform may have bugs or downtime</li>
            <li>We&rsquo;re not your lawyer, financial advisor, or registered broker-dealer</li>
            <li>
              Our liability is limited to what you&rsquo;ve paid us in the last 12
              months
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Ending your account
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>You can delete your account anytime by emailing team@raisefn.com</li>
            <li>
              We can suspend or terminate accounts that violate these terms (e.g.,
              misrepresentation, abuse, fraud)
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Changes
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              We may update these terms as the product evolves &mdash; we&rsquo;ll let
              you know if anything material changes
            </li>
            <li>
              Continuing to use raisefn after an update means you accept the new terms
            </li>
            <li>
              Questions:{" "}
              <a
                href="mailto:team@raisefn.com"
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                team@raisefn.com
              </a>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
