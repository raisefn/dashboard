"use client";

import { useRouter } from "next/navigation";
import FadeInSection from "@/components/fade-in-section";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
            Pricing
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6">
            Tools are free. Time is paid.
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Verified founders get the full AI fundraising platform — no credit
            card needed. When you want hands-on support running your raise,
            our team steps in.
          </p>
        </div>
      </section>

      {/* ── Technology ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Technology
              </h2>
              <span className="text-sm text-zinc-500">No credit card needed</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              The full Brain — every tool a founder needs to run a raise, all
              from natural conversation. No forms, no dashboards. Verify your
              LinkedIn and company website to unlock; takes about a minute.
            </p>

            <ul className="space-y-2 mb-10 list-none">
              {[
                "Investor matching — ranked by fit from 24,000+ rounds of real data",
                "Pipeline CRM — the Brain tracks every investor interaction automatically",
                "Meeting ingestion — paste a transcript, the Brain captures everything",
                "Outreach strategy — who to contact, how, and when",
                "Signal reading — what investors are actually doing, not just saying",
                "Term sheet intelligence — comp data and negotiation context",
                "Narrative analysis — how your story lands with target investors",
                "Deck analysis — calibrated feedback on positioning and structure",
                "Persistent memory — the Brain remembers your entire raise across sessions",
                "Unlimited queries for the duration of your raise",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-teal-400 mt-1 shrink-0 leading-none">•</span>
                  <span className="text-sm text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className="rounded-full border border-teal-700/50 bg-teal-950/20 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30 inline-block"
            >
              Get Verified
            </a>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Concierge ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Concierge
              </h2>
            </div>
            <p className="text-sm text-zinc-400 mb-4 max-w-xl">
              Hands-on fundraising support from a team that&apos;s been there.
              Together we&apos;ve raised over $21M across 1,100+ investor
              meetings — and we&apos;ve watched every kind of &ldquo;no&rdquo;
              and &ldquo;yes.&rdquo; We bring that pattern recognition to
              your raise.
            </p>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              We work alongside you for the duration of your raise — pitch
              positioning, investor matching, warm intros, meeting prep, term
              sheet review. Whatever the raise needs.
            </p>

            <ul className="space-y-2 mb-10 list-none">
              {[
                "Pitch positioning — how to land the narrative with each investor",
                "Investor matching + warm introductions from our network",
                "Outreach strategy — who to contact, in what order, what to lead with",
                "Meeting prep and debrief — before and after every investor conversation",
                "Term sheet review — comp data, red flags, and negotiation strategy",
                "Full Brain access throughout — all tools, unlimited queries",
                "Dramatically cheaper than a placement agent (3–5% of round)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-orange-400 mt-1 shrink-0 leading-none">•</span>
                  <span className="text-sm text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="mailto:team@raisefn.com?subject=Concierge%20inquiry"
              className="rounded-full border border-orange-700/50 bg-orange-950/20 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/30 inline-block"
            >
              Contact us
            </a>
          </div>
        </FadeInSection>
      </section>

      {/* ── The Difference ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              The Difference
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div>
              <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">
                Raising capital today
              </p>
              <div className="space-y-4">
                {[
                  "Investor conversations tracked in spreadsheets, CRMs, or your head",
                  "Weeks of research to find who's actually writing checks",
                  "No way to know if an investor is serious or stringing you along",
                  "Every founder starts from scratch — no one shares what worked",
                  "The best intel lives in private networks you're not in",
                ].map((text) => (
                  <p key={text} className="text-sm text-zinc-500 flex items-start gap-2">
                    <span className="text-zinc-600 mt-1 leading-none">•</span>
                    {text}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-6">
                raise(fn)
              </p>
              <div className="space-y-4">
                {[
                  "Live intelligence, not raw data",
                  "Answers, not spreadsheets",
                  "Gets smarter with every raise",
                  "Remembers everything — you don't have to",
                  "The intel founders never share, available to everyone",
                ].map((text) => (
                  <p key={text} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-teal-400 mt-1 leading-none">•</span>
                    {text}
                  </p>
                ))}
              </div>
            </div>
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
            <p className="text-zinc-500 mb-8">
              Sign up free. Tell us about your raise. We&apos;ll take it from there.
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Get started
            </button>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
