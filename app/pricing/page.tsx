"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import FadeInSection from "@/components/fade-in-section";

// Pricing v6 (2026-07-06): Explorer (Free) + Founder + Investor.
// Tiers named by audience — same product, different pricing depending
// on what you're raising. Agents (developer plug-ins) coming soon.
type Cadence = "monthly" | "annual";
type CheckoutTier =
  | "founder_monthly"
  | "founder_annual"
  | "investor_monthly"
  | "investor_annual";

export default function PricingPage() {
  const router = useRouter();
  const [, setAuthedToken] = useState<string | null>(null);
  const [cadence, setCadence] = useState<Cadence>("annual");
  const [checkoutLoading, setCheckoutLoading] = useState<CheckoutTier | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthedToken(session?.access_token ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthedToken(session?.access_token ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Auto-resume checkout after fresh signup. Intent is set by the
  // wall card before bouncing to /signup when the user wasn't authed.
  // Currently: resume-founder / resume-investor. Default cadence
  // matches the toggle default (annual).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const resume = params.get("checkout");
    if (resume === "resume-founder") {
      window.history.replaceState({}, "", window.location.pathname);
      startCheckout("founder_annual", { fromAutoResume: true });
    } else if (resume === "resume-investor") {
      window.history.replaceState({}, "", window.location.pathname);
      startCheckout("investor_annual", { fromAutoResume: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function waitForSession(timeoutMs: number): Promise<string | null> {
    const { data: { session: immediate } } = await supabase.auth.getSession();
    if (immediate?.access_token) return immediate.access_token;
    return new Promise<string | null>((resolve) => {
      let settled = false;
      const finish = (token: string | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        sub.subscription.unsubscribe();
        resolve(token);
      };
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session?.access_token) finish(session.access_token);
      });
      const timer = setTimeout(() => finish(null), timeoutMs);
    });
  }

  async function startCheckout(tier: CheckoutTier, opts?: { fromAutoResume?: boolean }) {
    setCheckoutError(null);
    const audience = tier.startsWith("founder") ? "founder" : "investor";
    let token: string | null = null;
    if (opts?.fromAutoResume) {
      token = await waitForSession(5000);
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token ?? null;
    }
    if (!token) {
      router.push(`/signup?after=upgrade-${audience}`);
      return;
    }

    setCheckoutLoading(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });
      if (res.status === 401) {
        router.push(`/signup?after=upgrade-${audience}`);
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.href = data.url;
    } catch (e) {
      setCheckoutLoading(null);
      setCheckoutError(
        "Couldn't start checkout — try again or email team@raisefn.com."
      );
      console.error("Stripe checkout error:", e);
    }
  }

  const isAnnual = cadence === "annual";
  const founderTier: CheckoutTier = isAnnual ? "founder_annual" : "founder_monthly";
  const investorTier: CheckoutTier = isAnnual ? "investor_annual" : "investor_monthly";

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
            The agent that runs your raise alongside you
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Sourcing, per-investor briefs, meeting prep, deck critique, pipeline
            that updates itself. Free to try. Same product, priced by what
            you&apos;re raising.
          </p>
        </div>
      </section>

      {/* ── Cadence toggle (applies to both Founder + Investor tiles) ── */}
      <section className="relative px-4 pt-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-zinc-800 bg-zinc-900/40 p-1">
            <button
              type="button"
              onClick={() => setCadence("monthly")}
              className={`rounded-full px-5 py-1.5 text-xs font-medium transition-colors ${
                cadence === "monthly"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCadence("annual")}
              className={`rounded-full px-5 py-1.5 text-xs font-medium transition-colors ${
                cadence === "annual"
                  ? "bg-teal-900/50 text-teal-200 border border-teal-700/50"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Annual <span className="text-[10px] font-semibold text-teal-400 ml-1">save 58%</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Explorer ── */}
      <section className="relative py-14 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Explorer
              </h2>
              <span className="text-sm text-zinc-500">$0 — for founders and investors</span>
            </div>
            <p className="text-sm text-zinc-400 mb-8 max-w-xl">
              Set up your agent, put it to work, see how it runs. All
              features available. Real limits — enough to prove the agent
              works, not enough to run a whole raise on.
            </p>

            <ul className="space-y-3 mb-8 list-none">
              {[
                ["Chat with the agent", "capped — explore your raise end-to-end"],
                ["Investor briefs", "capped — one-page summaries for any investor"],
                ["Investor matches", "capped — discover investors that fit"],
                ["Every capability", "no feature gates — same product, just limited use"],
              ].map(([name, desc]) => (
                <li key={name} className="flex items-start gap-3">
                  <span className="text-zinc-500 text-lg leading-snug shrink-0">•</span>
                  <span className="text-sm leading-relaxed">
                    <strong className="text-zinc-100 font-semibold">{name}</strong>
                    <span className="text-zinc-400"> — {desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className="rounded-full border border-zinc-700 bg-zinc-900/40 px-8 py-3 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-500 hover:bg-zinc-800/60 inline-block"
            >
              Start Explorer
            </a>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Founder ── */}
      <section className="relative py-14 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Founder
              </h2>
              <span className="text-sm text-zinc-500">
                {isAnnual
                  ? "$999/year · $83/month billed annually"
                  : "$199/month · cancel anytime"}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mb-8 max-w-xl">
              For founders actively raising for their company. Full agent,
              no caps. No success fee, no equity, no percentage of the round.
            </p>

            <ul className="space-y-3 mb-8 list-none">
              {[
                ["Uncapped chat with the agent", "ask anything, as often as you need"],
                ["Uncapped investor matches", "keep exploring until you find your fit"],
                ["Uncapped briefs", "one-page summaries for every investor you target"],
                ["Pipeline + memory across sessions", "the agent remembers every conversation"],
                ["All agent capabilities", "matching, deck review, outreach drafts, meeting prep, debriefs, term sheet walkthrough"],
              ].map(([name, desc]) => (
                <li key={name} className="flex items-start gap-3">
                  <span className="text-orange-400 text-lg leading-snug shrink-0">•</span>
                  <span className="text-sm leading-relaxed">
                    <strong className="text-zinc-100 font-semibold">{name}</strong>
                    <span className="text-zinc-400"> — {desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => startCheckout(founderTier)}
              disabled={checkoutLoading === founderTier}
              className="rounded-full border border-orange-600/60 bg-orange-900/30 px-8 py-3 text-sm font-medium text-orange-200 transition-all hover:border-orange-500 hover:bg-orange-900/50 disabled:opacity-50"
            >
              {checkoutLoading === founderTier
                ? "Opening checkout…"
                : isAnnual
                ? "Get Founder — $999/year"
                : "Get Founder — $199/mo"}
            </button>
            <p className="mt-3 text-xs text-zinc-500 max-w-xl">
              {isAnnual
                ? "Billed once, $999. Renews annually — cancel anytime from your account, access continues through your renewal date."
                : "Cancel anytime from your account. Access continues through the end of your billing period."}
            </p>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Investor ── */}
      <section className="relative py-14 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Investor
              </h2>
              <span className="text-sm text-zinc-500">
                {isAnnual
                  ? "$1,999/year · $167/month billed annually"
                  : "$399/month · cancel anytime"}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mb-8 max-w-xl">
              For investors actively raising a fund, deal, or SPV. Venture
              GPs raising Fund I / II, real estate developers raising for a
              deal, syndicate leads running SPVs. Full agent, no caps. No
              success fee, no percentage of the raise.
            </p>

            <ul className="space-y-3 mb-8 list-none">
              {[
                ["Uncapped chat with the agent", "ask anything, as often as you need"],
                ["Uncapped LP + investor targeting", "family offices, endowments, HNWs, JV partners, backers"],
                ["Uncapped briefs", "per-LP research, decision cadence, key contacts, side letters"],
                ["DDQ handling", "auto-filled from your fund profile, you review and send"],
                ["Pipeline + memory across sessions", "every conversation, every commitment, never lost"],
                ["All agent capabilities", "targeting, outreach, meeting prep, debriefs, close coordination"],
              ].map(([name, desc]) => (
                <li key={name} className="flex items-start gap-3">
                  <span className="text-teal-400 text-lg leading-snug shrink-0">•</span>
                  <span className="text-sm leading-relaxed">
                    <strong className="text-zinc-100 font-semibold">{name}</strong>
                    <span className="text-zinc-400"> — {desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => startCheckout(investorTier)}
              disabled={checkoutLoading === investorTier}
              className="rounded-full border border-teal-600/60 bg-teal-900/30 px-8 py-3 text-sm font-medium text-teal-200 transition-all hover:border-teal-500 hover:bg-teal-900/50 disabled:opacity-50"
            >
              {checkoutLoading === investorTier
                ? "Opening checkout…"
                : isAnnual
                ? "Get Investor — $1,999/year"
                : "Get Investor — $399/mo"}
            </button>
            <p className="mt-3 text-xs text-zinc-500 max-w-xl">
              {isAnnual
                ? "Billed once, $1,999. Renews annually — cancel anytime from your account, access continues through your renewal date."
                : "Cancel anytime from your account. Access continues through the end of your billing period."}
            </p>
            {checkoutError && (
              <div className="mt-3 text-xs text-red-400 max-w-xl">{checkoutError}</div>
            )}
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Agents (coming soon) ── */}
      <section className="relative py-14 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Agents
              </h2>
              <span className="text-sm text-zinc-500">Coming soon</span>
            </div>
            <p className="text-sm text-zinc-400 mb-6 max-w-xl">
              Connect your personal ChatGPT, Claude, or any AI assistant to
              your raise(fn) data. Query your pipeline, draft the follow-up,
              run the raise from your tools. Pricing announced at launch.
            </p>
            <a
              href="/agents"
              className="rounded-full border border-zinc-700 bg-zinc-900/40 px-8 py-3 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-500 hover:bg-zinc-800/60 inline-block"
            >
              Join the waitlist
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
                  "Every raise starts from scratch — no one shares what worked",
                  "Meeting prep and debriefs live in your head, if they exist at all",
                ].map((text) => (
                  <p key={text} className="text-sm text-zinc-500 flex items-start gap-3 leading-relaxed">
                    <span className="text-zinc-600 text-lg leading-snug shrink-0">•</span>
                    <span>{text}</span>
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
                  "The agent runs the raise — you take the calls",
                  "Ranked investors, tailored briefs, meeting prep, debriefs — one chat",
                  "Pipeline captured automatically as you work",
                  "Memory across sessions — pick up exactly where you left off",
                  "Gets sharper as more raises run through it",
                ].map((text) => (
                  <p key={text} className="text-sm text-zinc-300 flex items-start gap-3 leading-relaxed">
                    <span className="text-teal-400 text-lg leading-snug shrink-0">•</span>
                    <span>{text}</span>
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
              Set up your agent.
            </h2>
            <p className="text-zinc-500 mb-8">
              Free to start. No credit card. The agent gets to work as soon as you finish.
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Set up your agent →
            </button>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
