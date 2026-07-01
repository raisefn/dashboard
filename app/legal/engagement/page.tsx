import Link from "next/link";

export const metadata = {
  title: "Advisor Engagement | raise(fn)",
  description:
    "raise(fn) Advisor engagement terms — one month of hands-on setup and guidance, then Pro ongoing. $1,997 today ($199 first month Pro + $1,798 setup), then $199/mo.",
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
            What we do
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            One month of hands-on setup and guidance, then Pro ongoing.
          </p>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <span className="text-white font-medium">Month 1 hands-on</span>{" "}
              &mdash; We set your agent up for you, dial in your investor sourcing,
              guide you through the first month of your raise, and make warm intros
              to our proprietary network when there&rsquo;s a real match.
            </li>
            <li>
              <span className="text-white font-medium">Month 2 onward</span>{" "}
              &mdash; You continue on raise(fn) Pro at $199/mo. Uncapped agent,
              matches, briefs, meeting prep, pipeline. Cancel anytime.
            </li>
          </ul>
          <p className="text-sm text-zinc-400 mt-4">
            You decide who to talk to, what to say, what terms to take. We advise; you act.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What you pay
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            <span className="text-white font-medium">$1,997 today.</span>{" "}
            This covers:
          </p>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <span className="text-white font-medium">$199</span>{" "}
              &mdash; your first month of raise(fn) Pro (agent access, uncapped).
            </li>
            <li>
              <span className="text-white font-medium">$1,798</span>{" "}
              &mdash; setup + month 1 hands-on guidance + warm intros from raise(fn) Team.
            </li>
          </ul>
          <p className="text-sm text-zinc-400 mt-4">
            Starting day 31, Pro auto-renews at{" "}
            <span className="text-white font-medium">$199/mo</span>. Cancel
            anytime from your account or by emailing team@raisefn.com.
          </p>
          <p className="text-sm text-zinc-400 mt-4 mb-2">Also:</p>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              No success fee. We don&rsquo;t get paid based on whether your round closes
              or how much you raise.
            </li>
            <li>
              raise(fn) is not a registered broker-dealer. No cut of capital raised,
              no equity, no securities brokering.
            </li>
            <li>
              <span className="text-white font-medium">All purchases final.</span> Funds
              paid are funds paid.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            How long it runs
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            Month 1 is the hands-on engagement. After that, you&rsquo;re on Pro
            ongoing at $199/mo, no fixed end date. You choose when to cancel.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Ending early
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              You can stop future Pro charges anytime &mdash; from your account or
              by emailing us at{" "}
              <a
                href="mailto:team@raisefn.com"
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                team@raisefn.com
              </a>
              . We cancel the next month&rsquo;s payment immediately.
            </li>
            <li>The $1,997 you paid at checkout stays paid.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What you keep
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              Everything we make for you &mdash; agent setup, sourcing, briefs, warm
              intro paths &mdash; is yours. Use it however you want, forever.
            </li>
            <li>
              We learn from the engagement in aggregate (what kinds of pitches land, what
              investors ask) and use those learnings to make raise(fn) better for everyone
              else. Your specific data stays yours.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Confidentiality
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              We don&rsquo;t share your business plans, financials, investor conversations,
              or round details with anyone outside raise(fn) &mdash; unless you tell us to
              or the law requires it.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What we don&rsquo;t promise
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>We can&rsquo;t guarantee investors will respond, meet with you, or invest.</li>
            <li>We can&rsquo;t guarantee terms.</li>
            <li>We can&rsquo;t guarantee your round closes.</li>
          </ul>
          <p className="text-sm text-zinc-400 mt-4">
            We&rsquo;re a tool and a team that helps. The outcome is yours.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Limits
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              If something goes sideways and you sue, our total liability is capped at what
              you&rsquo;ve paid us under this agreement.
            </li>
            <li>We&rsquo;re not on the hook for indirect or consequential damages.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            How we work together
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              raise(fn) is an independent contractor. We&rsquo;re not your partner,
              employer, agent, or fiduciary. We work alongside you on your raise.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            The legal stuff
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>California law governs this agreement.</li>
            <li>
              This agreement plus our{" "}
              <a
                href="/terms"
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                Terms of Service
              </a>{" "}
              is the full deal. It supersedes any prior agreements about the Advisor
              engagement.
            </li>
            <li>
              By paying the $1,997 checkout on raisefn.com, you accept these terms.
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
