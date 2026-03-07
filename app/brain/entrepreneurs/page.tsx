import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

export default function EntrepreneursPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
            Brain for Entrepreneurs
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6">
            Raise with intelligence,{" "}
            <span className="text-teal-400">not guesswork</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Every decision in your raise — who to pitch, when to go out, what
            terms to accept — the brain gives you the data to make it well.
          </p>
        </div>
      </section>

      {/* ── Without vs With ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-2xl space-y-12">
            {[
              {
                q: "Who should I pitch?",
                without: "Spreadsheets from Twitter. Intros that lead nowhere.",
                with: "Investors ranked by actual fit — sector, stage, check size, and who's actively deploying right now.",
              },
              {
                q: "Am I ready to raise?",
                without: "Conflicting advice from friends and blog posts.",
                with: "Your metrics vs. projects that raised at your stage. Gaps identified, not guessed.",
              },
              {
                q: "Is my pitch landing?",
                without: "Burn through 20 meetings to find out.",
                with: "Your narrative tested against what each investor responds to — before you send it.",
              },
              {
                q: "What do these signals mean?",
                without: "That slow follow-up. The associate redirect. Silence.",
                with: "Behavioral patterns decoded from real data. Know where you stand.",
              },
              {
                q: "Are these terms fair?",
                without: "Ask your lawyer. Ask Twitter. Hope for the best.",
                with: "Market-rate terms for your stage and sector. Know where you have leverage.",
              },
            ].map((item) => (
              <div key={item.q}>
                <p className="text-white font-semibold text-lg mb-4">
                  &ldquo;{item.q}&rdquo;
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <p className="text-sm text-zinc-600 border-l-2 border-zinc-800 pl-4">
                    {item.without}
                  </p>
                  <p className="text-sm text-zinc-300 border-l-2 border-teal-800/50 pl-4">
                    {item.with}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Ready to raise smarter?
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <a
                href="mailto:justinpetsche@gmail.com?subject=raise(fn) Brain — Entrepreneur Access"
                className="rounded-full border border-teal-700/50 bg-teal-950/30 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/40"
              >
                Request Early Access
              </a>
              <Link
                href="/brain"
                className="rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
              >
                Back to the Brain
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
