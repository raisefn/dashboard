"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Marketing v3 footer. Two columns:
// - Product: surfaces that moved out of the top nav (Brain landing,
//   Tracker, Agents) plus Pricing as a convenience repeat.
// - Company: legal + roadmap + contact.
//
// Hidden on the same routes nav.tsx hides on — product surfaces and the
// public brief page. The product chrome at /brain/deploy/* renders its
// own minimal top bar; appending a marketing footer there would feel
// jarring and waste vertical space.

export default function Footer() {
  const pathname = usePathname();

  // Brief surface — its own brand layout.
  if (pathname.startsWith("/brief")) return null;

  // Product surfaces — match nav.tsx's hide rules exactly.
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

  return (
    <footer className="relative mt-32 border-t border-zinc-800/60 bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold">
              <span className="text-orange-500">raise</span>
              <span className="text-teal-400">(fn)</span>
            </Link>
            <p className="mt-3 text-xs text-zinc-500 leading-relaxed max-w-xs">
              Fundraising intelligence for founders, investors, and the AI
              assistants that work alongside them.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Product
            </p>
            <ul className="space-y-2.5">
              {[
                { href: "/brain", label: "The Brain" },
                { href: "/tracker", label: "The Tracker" },
                { href: "/raise-intel", label: "Raise Intel" },
                { href: "/roadmap", label: "Roadmap" },
                { href: "/pricing", label: "Pricing" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Audience */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              For
            </p>
            <ul className="space-y-2.5">
              {[
                { href: "/founders", label: "Founders" },
                { href: "/investors", label: "Investors" },
                { href: "/agents", label: "Agents" },
                { href: "/investors/join", label: "Join as an investor" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Company
            </p>
            <ul className="space-y-2.5">
              {[
                { href: "/how-we-match", label: "How we match" },
                { href: "/how-we-learn", label: "How we learn" },
                { href: "/faq", label: "FAQ" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
                { href: "mailto:team@raisefn.com", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-zinc-800/40 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} raise(fn). All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            Built in San Diego.
          </p>
        </div>
      </div>
    </footer>
  );
}
