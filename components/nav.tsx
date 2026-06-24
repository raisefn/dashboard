"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import TrackerSearch from "@/components/tracker-search";

// Marketing v3 (2026-06-10): audience-centric top nav. Brain landing,
// Tracker (Eyes & Ears), and Roadmap move to the footer. Developer SDK
// is killed — replaced by /agents with a different framing (founders +
// investors plugging in personal AI assistants, not third-party devs).
const topLinks = [
  { href: "/founders", label: "For Founders", prefix: "/founders" },
  { href: "/investors", label: "For Investors", prefix: "/investors" },
  { href: "/agents", label: "For Agents", prefix: "/agents" },
  { href: "/pricing", label: "Pricing", prefix: "/pricing" },
];

const trackerLinks = [
  { href: "/tracker/feed", label: "Live Feed" },
  { href: "/tracker/pulse", label: "Market Pulse" },
  { href: "/tracker/rounds", label: "Rounds" },
  { href: "/tracker/investors", label: "Investors" },
  { href: "/tracker/projects", label: "Projects" },
];

const brainLinks = [
  { href: "/brain/entrepreneurs", label: "Founders" },
  { href: "/brain/investors", label: "Investors" },
  { href: "/brain/agents", label: "Developers" },
];

export default function Nav() {
  const pathname = usePathname();
  const isTracker = pathname.startsWith("/tracker");
  const isBrain = pathname.startsWith("/brain");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mirror of tier from chat's usage event (written to localStorage by the
  // brain page). Lets us render the Upgrade pill on /brain pages without a
  // separate fetch. Hidden for Advisor users. Hydration-safe by gating on
  // mounted-after-hydration.
  const [userTier, setUserTier] = useState<string | null>(null);
  useEffect(() => {
    const read = () => {
      try {
        setUserTier(localStorage.getItem("raisefn_user_tier"));
      } catch { /* private browsing */ }
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  const subLinks = isTracker ? trackerLinks : isBrain ? brainLinks : null;

  // /brief/<token> is a public shareable brief surface sent to external
  // investors. It uses its own brand layout and must not show dashboard
  // navigation. Same for the legal/engagement page convention.
  if (pathname.startsWith("/brief")) {
    return null;
  }

  // Brain product surfaces — chat, matches, briefs — are the founder's
  // working environment. They render their own product-style top bar
  // (logo + tabs + account) so we don't want the marketing nav on top.
  if (
    pathname === "/brain/deploy" ||
    pathname.startsWith("/brain/deploy/") ||
    pathname === "/brain/matches" ||
    pathname.startsWith("/brain/matches/") ||
    pathname === "/brain/briefs" ||
    pathname.startsWith("/brain/briefs/")
  ) {
    return null;
  }

  // Upgrade pill: show on /brain pages when a non-Advisor user is signed
  // in. Reads from the localStorage mirror written by the chat page's
  // usage SSE event handler.
  const showUpgrade = isBrain && userTier === "free";

  return (
    <>
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md">
      {/* Primary nav */}
      <nav className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="text-lg font-bold">
            <span className="text-orange-500">raise</span>
            <span className="text-teal-400">(fn)</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex gap-1">
            {topLinks.map((link) => {
              const active = pathname.startsWith(link.prefix);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-zinc-800/80 text-teal-400"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: Log in + Get Started + hamburger */}
          <div className="flex items-center gap-3">
            {showUpgrade && (
              <Link
                href="/pricing"
                className="hidden sm:inline-flex rounded-full border border-orange-700/60 bg-orange-950/30 px-4 py-1.5 text-xs font-semibold text-orange-200 hover:bg-orange-900/40 hover:text-orange-100 transition-colors"
              >
                Upgrade
              </Link>
            )}
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-orange-600 px-5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Start your raise →
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col gap-1 p-1"
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-5 bg-zinc-400 transition-all ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 w-5 bg-zinc-400 transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-zinc-400 transition-all ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-800 px-4 py-3 space-y-1">
            {topLinks.map((link) => {
              const active = pathname.startsWith(link.prefix);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-zinc-800/80 text-teal-400"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {subLinks && (
        <nav className="border-b border-zinc-800/60 bg-zinc-950/60">
          <div className="relative mx-auto flex max-w-7xl items-center justify-center px-4 py-2">
            <div className="flex items-center gap-4 sm:gap-6">
              {subLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${
                      active
                        ? "text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            {isTracker && (
              <div className="absolute right-4">
                <TrackerSearch />
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
    </>
  );
}
