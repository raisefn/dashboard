"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import EarlyAccessModal from "@/components/early-access-modal";

const topLinks = [
  { href: "/tracker", label: "Eyes & Ears", prefix: "/tracker" },
  { href: "/brain", label: "Brain", prefix: "/brain" },
  { href: "/sdk", label: "Agent SDK", prefix: "/sdk" },
  { href: "/pricing", label: "Pricing", prefix: "/pricing" },
];

const trackerLinks = [
  { href: "/tracker/projects", label: "Projects" },
  { href: "/tracker/rounds", label: "Rounds" },
  { href: "/tracker/investors", label: "Investors" },
];

const brainLinks = [
  { href: "/brain/entrepreneurs", label: "Entrepreneurs" },
  { href: "/brain/investors", label: "Investors" },
  { href: "/brain/agents", label: "Agents" },
];

export default function Nav() {
  const pathname = usePathname();
  const isTracker = pathname.startsWith("/tracker");
  const isBrain = pathname.startsWith("/brain");
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);

  // TODO: restore sub-nav when tracker/brain pages are built
  // const subLinks = isTracker ? trackerLinks : isBrain ? brainLinks : null;
  const subLinks: typeof trackerLinks | null = null;

  return (
    <>
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md">
      {/* Primary nav */}
      <nav className="border-b border-zinc-800">
        <div className="relative mx-auto flex max-w-7xl items-center justify-center px-4 py-3">
          {/* Logo — absolute left */}
          <Link href="/" className="absolute left-4 text-lg font-bold">
            <span className="text-orange-500">raise</span>
            <span className="text-teal-400">(fn)</span>
          </Link>

          {/* Centered links */}
          <div className="flex gap-1">
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

          {/* Early Access — absolute right */}
          <button
            onClick={() => setShowEarlyAccess(true)}
            className="absolute right-4 rounded-full bg-orange-600 px-5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
          >
            Early Access
          </button>
        </div>
      </nav>

      {/* Sub-nav (tracker or brain) */}
      {subLinks && (
        <nav className="border-b border-zinc-800/60 bg-zinc-950/60">
          <div className="relative mx-auto flex max-w-7xl items-center justify-center px-4 py-2">
            <div className="flex gap-6">
              {subLinks.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href === "/tracker/projects" && pathname === "/tracker");
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
          </div>
        </nav>
      )}
    </header>
    <EarlyAccessModal open={showEarlyAccess} onClose={() => setShowEarlyAccess(false)} />
    </>
  );
}
