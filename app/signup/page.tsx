"use client";

import Link from "next/link";

// /signup — role chooser. Two hard-forked paths because the downstream
// forms ask different questions (founder company/raise vs investor
// fund/deal/LP archetype). No default; user picks explicitly.
//
// Direct entrypoints:
//   /signup/founder  — founder signup form
//   /raise-fund/join — investor signup form
//
// Founder-oriented pages (/founders, /how-we-learn, /how-we-match)
// link straight to /signup/founder to skip this step. Ambiguous entry
// points (top nav CTA, homepage, /faq, /pricing, /auth fallback) route
// through this chooser.
export default function SignupChooserPage() {
  return (
    <div className="relative min-h-[80vh] px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
            Get started
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            What are you raising?
          </h1>
          <p className="text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            raise(fn) runs the raise with you. Pick your path — the agent
            asks different questions depending on what you&apos;re raising.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Founder path */}
          <Link
            href="/signup/founder"
            className="group relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/30 p-7 transition-all hover:border-orange-700/60 hover:bg-zinc-900/60"
          >
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-950/40 text-2xl">
              🚀
            </div>
            <p className="text-lg font-semibold text-white mb-2">
              I&apos;m raising for my company
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed mb-5 flex-1">
              Founders raising a pre-seed, seed, Series A, or bridge. The
              agent sources the right investors, drafts the outreach,
              preps you for meetings, and tracks the pipeline.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Free to start · 30-second signup
              </span>
              <span className="text-sm font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
                Founder signup →
              </span>
            </div>
          </Link>

          {/* Investor path */}
          <Link
            href="/raise-fund/join"
            className="group relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/30 p-7 transition-all hover:border-teal-700/60 hover:bg-zinc-900/60"
          >
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-950/40 text-2xl">
              💼
            </div>
            <p className="text-lg font-semibold text-white mb-2">
              I&apos;m raising a fund, deal, or SPV
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed mb-5 flex-1">
              Venture GPs, real estate developers, and syndicate leads
              raising from LPs, JV partners, and backers. The agent handles
              targeting, briefs, DDQs, and pipeline to close.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Free to start · 5-minute signup
              </span>
              <span className="text-sm font-semibold text-teal-400 group-hover:text-teal-300 transition-colors">
                Investor signup →
              </span>
            </div>
          </Link>
        </div>

        {/* Tertiary — developers integrating raise(fn) into their own AI
            tooling. Not a signup path here; /agents explains what's
            available. */}
        <div className="mt-10 text-center">
          <p className="text-xs text-zinc-600">
            Building on top of raise(fn)?{" "}
            <Link href="/agents" className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2">
              For developers →
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-400 hover:text-teal-300">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
