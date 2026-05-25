import Link from "next/link";

export const metadata = {
  title: "Advisor Engagement | raise(fn)",
  description:
    "raise(fn) Advisor engagement terms — $999 one-time + 2% success fee on raisefn-introduced capital.",
};

export default function EngagementPage() {
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
        <h1 className="text-2xl font-bold text-white mb-2">Advisor Engagement</h1>
        <p className="text-sm text-zinc-500 mb-2">Plain English. No legalese.</p>
        <p className="text-sm text-zinc-500 mb-12">
          Between: raise(fn) Inc. and the founder accepting these terms at checkout.
          Date: as recorded at acceptance.
        </p>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What raisefn does
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              Unlimited access to the raise(fn) platform: investor matching, pitch
              coaching, pipeline tracking
            </li>
            <li>Curated warm introductions from our proprietary investor network</li>
            <li>One 1-hour advisory call with the raise(fn) team</li>
            <li>Outreach strategy and term sheet review on request</li>
            <li>Available by email throughout the engagement</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What you pay
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <span className="text-white font-medium">$999 one-time</span>, billed via
              Stripe at checkout
            </li>
            <li>
              <span className="text-white font-medium">2% of any capital committed</span>{" "}
              by an investor we introduce
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What counts as an introduction
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>An investor we connect you to who you weren&rsquo;t already actively talking to</li>
            <li>
              We send you written confirmation each time we make one &mdash; both of us
              have a record
            </li>
            <li>You can see every qualifying intro in your raise(fn) dashboard</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            When the 2% is owed
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              When capital actually hits your bank account &mdash; not when a term sheet
              is signed
            </li>
            <li>Payment due within 30 days of receipt</li>
            <li>
              If the round closes in tranches, the fee comes proportionally with each
              tranche
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What the 2% applies to
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              Equity investments (SAFEs, priced rounds, convertible notes) from investors
              we introduced
            </li>
            <li>Not grants, debt financing, or revenue-based financing</li>
            <li>
              Not investors you were already in conversation with before our introduction
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Tail period
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              If we end the active engagement and an investor we introduced commits
              capital within 12 months, the 2% still applies
            </li>
            <li>
              This protects us from a founder ending the engagement right before closing
              a deal we sourced
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What we&rsquo;re not
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>Not a placement agent or broker-dealer</li>
            <li>
              We make introductions and advise &mdash; we don&rsquo;t negotiate or close
              on your behalf
            </li>
            <li>We don&rsquo;t guarantee meetings, term sheets, or funding outcomes</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Confidentiality
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              Anything you share with us &mdash; financials, cap table, deal terms
              &mdash; stays confidential
            </li>
            <li>
              The same goes the other way: investor names, our notes, and our data stay
              between us
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Ending the engagement
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>Either of us can end the active engagement with 14 days&rsquo; written notice</li>
            <li>Your lifetime product access continues regardless</li>
            <li>
              After ending: we stop making new intros; the 12-month tail still applies to
              intros already made
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What we don&rsquo;t promise
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>Our total liability is limited to fees you&rsquo;ve paid in the 12 months prior</li>
            <li>This agreement is governed by the laws of Delaware</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Accepted
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <span className="text-white font-medium">raise(fn) Inc.</span> &mdash; terms
              offered to all founders accepting at checkout
            </li>
            <li>
              <span className="text-white font-medium">Founder</span> &mdash; acceptance
              recorded electronically at checkout, timestamped, and held with your account
            </li>
          </ul>
        </section>

        <section className="pt-8 border-t border-zinc-800/50">
          <p className="text-sm text-zinc-500">
            Questions:{" "}
            <a
              href="mailto:team@raisefn.com"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              team@raisefn.com
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
