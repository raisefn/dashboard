"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

/**
 * Shared sub-nav for all /brain/* pages. Pills for Chat | Matches | Briefs
 * with live counts pulled from /v1/brain/matches/mine. Mount under the page
 * header so the active surface is always one click away from anywhere in
 * the brain product.
 *
 * Counts refresh on mount; the data is the same payload /brain/matches
 * already calls, so no extra brain pressure.
 */
type Counts = { matches: number; briefs: number };

const TABS: Array<{ key: "chat" | "matches" | "briefs"; label: string; href: string }> = [
  { key: "chat", label: "Chat", href: "/brain/deploy" },
  { key: "matches", label: "Matches", href: "/brain/matches" },
  { key: "briefs", label: "Briefs", href: "/brain/briefs" },
];

export default function BrainTabs() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch("/v1/brain/matches/mine", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const matchList = data.match_list as
          | {
              individuals_to_target?: unknown[];
              firms_to_consider?: unknown[];
            }
          | null;
        const matchCount = matchList
          ? (matchList.individuals_to_target?.length || 0) +
            (matchList.firms_to_consider?.length || 0)
          : 0;
        const briefCount = Array.isArray(data.briefs) ? data.briefs.length : 0;
        if (!cancelled) setCounts({ matches: matchCount, briefs: briefCount });
      } catch {
        // Counts are best-effort.
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  function isActive(href: string): boolean {
    if (href === "/brain/deploy") return pathname?.startsWith("/brain/deploy") ?? false;
    return pathname === href;
  }

  function countFor(key: "chat" | "matches" | "briefs"): number | null {
    if (!counts) return null;
    if (key === "matches") return counts.matches;
    if (key === "briefs") return counts.briefs;
    return null;
  }

  return (
    <div className="border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4">
        <nav className="flex items-center gap-1 -mb-px">
          {TABS.map((tab) => {
            const active = isActive(tab.href);
            const count = countFor(tab.key);
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  active
                    ? "text-zinc-100 border-teal-400"
                    : "text-zinc-500 hover:text-zinc-300 border-transparent"
                }`}
              >
                <span>{tab.label}</span>
                {count !== null && count > 0 && (
                  <span
                    className={`text-xs rounded-full px-2 py-0.5 ${
                      active ? "bg-zinc-800 text-zinc-200" : "bg-zinc-900 text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
