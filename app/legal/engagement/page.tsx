import Link from "next/link";

export const metadata = {
  title: "Advisor Engagement | raise(fn)",
  description:
    "raise(fn) Advisor engagement terms — three months of hands-on support while you raise. $999/month for 3 months or $1,999 upfront.",
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
            Three months of hands-on support while you raise.
          </p>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <span className="text-white font-medium">Month 1</span> &mdash; We build your
              investor shortlist, write tailored briefs for the top matches, sequence the
              outreach, and have a kickoff call.
            </li>
            <li>
              <span className="text-white font-medium">Month 2</span> &mdash; We prep you
              before every investor meeting, debrief after, and track the pipeline live with
              you. Weekly check-ins.
            </li>
            <li>
              <span className="text-white font-medium">Month 3</span> &mdash; We help with
              close support, write the materials you need to land the round, and set you up
              to keep using raise(fn) Pro on your own afterward.
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
          <p className="text-sm text-zinc-400 mb-4">Two ways to pay:</p>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <span className="text-white font-medium">Monthly &mdash; $999/month for 3 months.</span>{" "}
              Auto-debited each month, $2,997 total. You can stop future charges anytime by
              emailing team@raisefn.com.
            </li>
            <li>
              <span className="text-white font-medium">Upfront &mdash; $1,999 once.</span>{" "}
              That&rsquo;s ~33% off the monthly total. Same scope, same engagement, no
              recurring charges.
            </li>
          </ul>
          <p className="text-sm text-zinc-400 mt-4 mb-2">Either way:</p>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              No success fee. We don&rsquo;t get paid based on whether your round closes or
              how much you raise.
            </li>
            <li>
              raise(fn) is not a registered broker-dealer. No cut of capital raised, no
              equity, no securities brokering.
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
          <p className="text-sm text-zinc-400 mb-4">3 months. After that, you choose:</p>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>Keep Advisor going at $999/month (cancel anytime, no commitment)</li>
            <li>Drop to raise(fn) Pro at $199/month (software only)</li>
            <li>End the engagement &mdash; you go back to the free tier</li>
          </ul>
          <p className="text-sm text-zinc-400 mt-4">
            If you don&rsquo;t tell us within 7 days of the engagement ending, we default to
            ending it. No surprise charges.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Ending early
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              You can stop future charges anytime &mdash; just email us at{" "}
              <a
                href="mailto:team@raisefn.com"
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                team@raisefn.com
              </a>
              . We cancel the next month&rsquo;s payment immediately.
            </li>
            <li>Funds paid stay paid.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            What you keep
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              Everything we make for you &mdash; briefs, prep docs, debriefs, close
              materials, positioning &mdash; is yours. Use it however you want, forever.
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
              By paying the first $999 monthly or the $1,999 upfront on raisefn.com, you
              accept these terms.
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
