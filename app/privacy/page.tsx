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
            <li>Conversations with the agent</li>
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
              To power your raise(fn) experience &mdash; investor matching, pipeline
              recall, readiness benchmarking, and everything the agent does for you
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
            <li>raisefn team (for support only)</li>
            <li>
              We do not share your data with other users of the platform. Your
              conversations, meeting notes, pipeline status, and fundraising
              activity stay private to your account.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Google API access (Gmail, Calendar)
          </h2>
          <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
            When you connect your Google account, raise(fn) requests only the scopes
            required to run your raise. We never access, read, or store Google account
            data outside these specific uses.
          </p>
          <ul className="space-y-3 text-sm leading-relaxed">
            <li>
              <span className="text-white font-medium">gmail.send</span> &mdash; used
              to send outreach emails on your behalf. Every email is drafted in the
              app and requires your explicit approval via the Send button before it&rsquo;s
              transmitted. raise(fn) never sends automatically without your action.
            </li>
            <li>
              <span className="text-white font-medium">calendar.events</span> &mdash;
              used to create calendar invites for investor meetings. Every invite
              requires your explicit approval via the Send Invite button before it&rsquo;s
              transmitted to Google Calendar.
            </li>
          </ul>
          <p className="text-sm text-zinc-400 mt-4 mb-2 leading-relaxed">
            <span className="text-white font-medium">What we don&rsquo;t do:</span>
          </p>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>We do not read your incoming mail.</li>
            <li>We do not access your Gmail search history, contacts, or attachments outside outbound emails you approve.</li>
            <li>We do not transfer Google user data to any third party.</li>
            <li>We do not use Google user data for AI/ML training.</li>
            <li>We do not permit humans to read your Google user data except: (a) with your explicit consent, (b) to comply with applicable law, (c) for security investigations of abuse, or (d) for aggregate anonymized product improvement.</li>
          </ul>
          <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
            raise(fn)&rsquo;s use and transfer of information received from Google APIs
            adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              className="text-teal-400 hover:text-teal-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
          <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
            You can revoke raise(fn)&rsquo;s access to your Google account at any time
            from your{" "}
            <a
              href="https://myaccount.google.com/permissions"
              className="text-teal-400 hover:text-teal-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google account permissions page
            </a>{" "}
            or from the Connections panel inside raise(fn).
          </p>
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
