"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import FadeInSection from "@/components/fade-in-section";

type Tier = "pro" | "advisor";

export default function PricingPage() {
  const router = useRouter();
  const [, setAuthedToken] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<Tier | null>(null);
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

  // Auto-resume Pro checkout after fresh signup (pendingPostAuthIntent set by
  // the wall card before bouncing to /signup when the user wasn't authed yet).
  // Advisor is now contact-us only — no self-serve checkout.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const resume = params.get("checkout");
    if (resume !== "resume-pro") return;
    window.history.replaceState({}, "", window.location.pathname);
    startCheckout("pro", { fromAutoResume: true });
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

  async function startCheckout(tier: Tier, opts?: { fromAutoResume?: boolean }) {
    setCheckoutError(null);
    let token: string | null = null;
    if (opts?.fromAutoResume) {
      token = await waitForSession(5000);
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token ?? null;
    }
    if (!token) {
      router.push(`/signup?after=upgrade-${tier}`);
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
        router.push(`/signup?after=upgrade-${tier}`);
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
            that updates itself. Free to try. Pro when you&apos;re in the work.
            Hands-on Advisor support available on request.
          </p>
        </div>
      </section>

      {/* ── Free ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Free
              </h2>
              <span className="text-sm text-zinc-500">$0 — try the agent</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              Set up your agent, put it to work, get real matches. Free
              to get started. Upgrade when you need more.
            </p>

            <ul className="space-y-4 mb-10 list-none">
              {[
                ["Chat with the agent", "limited — explore your raise end-to-end"],
                ["Investor briefs", "limited — one-page summaries for any investor, matched or known"],
                ["Investor matches", "limited — discover new investors that fit"],
                ["Full agent otherwise", "no feature gates — every capability available"],
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
              Start Free
            </a>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Pro ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Pro
              </h2>
              <span className="text-sm text-zinc-500">$199/mo · cancel anytime</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              For founders actively raising. Full agent, no caps. Pay monthly,
              cancel anytime. No engagement letter, no success fee.
            </p>

            <ul className="space-y-4 mb-10 list-none">
              {[
                ["Uncapped chat with the agent", "ask anything, as often as you need"],
                ["Uncapped investor matches", "keep exploring until you find your fit"],
                ["Uncapped briefs", "one-page summaries for every investor you target"],
                ["Pipeline + memory across sessions", "the agent remembers every conversation"],
                ["All agent capabilities", "matching, deck review, outreach drafts, meeting prep, debriefs, term sheet walkthrough"],
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
              onClick={() => startCheckout("pro")}
              disabled={checkoutLoading === "pro"}
              className="rounded-full border border-teal-600/60 bg-teal-900/30 px-8 py-3 text-sm font-medium text-teal-200 transition-all hover:border-teal-500 hover:bg-teal-900/50 disabled:opacity-50"
            >
              {checkoutLoading === "pro" ? "Opening checkout…" : "Get Pro — $199/mo"}
            </button>
            <p className="mt-3 text-xs text-zinc-500 max-w-xl">
              Cancel anytime from your account. Access continues through the
              end of your billing period.
            </p>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Advisor ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Advisor
              </h2>
              <span className="text-sm text-zinc-500">$1,997 today · $199/mo after month 1</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              Month 1 with raise(fn) Team hands-on. We set your agent up for
              you, guide you through the first month of your raise, and make
              warm intros to our proprietary investor network when we can. Pro
              continues at $199/mo after that, cancel anytime. No success fees.
              No equity.
            </p>

            <ul className="space-y-4 mb-10 list-none">
              {[
                ["Agent setup, done for you", "profile, taxonomy, sourcing dialed in on day one"],
                ["Month 1 hands-on guidance", "raise(fn) Team in the loop on your outreach, briefs, and meetings"],
                ["Warm intros to our proprietary network", "when there's a real match, Justin makes the intro personally"],
                ["Everything in Pro, uncapped", "matches, briefs, deck critique, meeting prep, pipeline"],
                ["Pro from month 2 onward", "$199/mo recurring, cancel anytime"],
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
              onClick={() => startCheckout("advisor")}
              disabled={checkoutLoading === "advisor"}
              className="rounded-full border border-orange-600/60 bg-orange-900/30 px-8 py-3 text-sm font-medium text-orange-200 transition-all hover:border-orange-500 hover:bg-orange-900/50 disabled:opacity-50"
            >
              {checkoutLoading === "advisor" ? "Opening checkout…" : "Get Advisor — $1,997"}
            </button>
            <p className="mt-3 text-xs text-zinc-500 max-w-xl">
              $1,997 today covers your first month of Pro ($199) plus setup and
              guidance ($1,798). Pro auto-renews at $199/mo starting day 31 —
              cancel anytime from your account.
            </p>
            {checkoutError && (
              <div className="mt-3 text-xs text-red-400 max-w-xl">{checkoutError}</div>
            )}
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
                  "Live intelligence, not raw data",
                  "Answers, not spreadsheets",
                  "Gets smarter with every raise",
                  "Remembers everything — you don't have to",
                  "The intel founders never share, available to everyone",
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
              Start your raise.
            </h2>
            <p className="text-zinc-500 mb-8">
              Free to start. No credit card. The agent gets to work as soon as you upload.
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Start your raise →
            </button>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
