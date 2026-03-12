"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import EarlyAccessModal from "@/components/early-access-modal";
import TrackerSearch from "@/components/tracker-search";

const topLinks = [
  { href: "/brain", label: "Brain", prefix: "/brain" },
  { href: "/tracker", label: "Eyes & Ears", prefix: "/tracker" },
  { href: "/sdk", label: "Developer SDK", prefix: "/sdk" },
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
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const subLinks = isTracker ? trackerLinks : isBrain ? brainLinks : null;

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

          {/* Right side: Early Access + hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEarlyAccess(true)}
              className="rounded-full bg-orange-600 px-5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Early Access
            </button>

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
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
            <div className="flex gap-4 sm:gap-6">
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
            {isTracker && <TrackerSearch />}
          </div>
        </nav>
      )}
    </header>
    <EarlyAccessModal open={showEarlyAccess} onClose={() => setShowEarlyAccess(false)} />
    </>
  );
}
