"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

/**
 * The brain product's single top bar — shown on /brain/deploy,
 * /brain/matches, /brain/briefs. The marketing-style global Nav is
 * suppressed on these paths (see components/nav.tsx) so this is the
 * ONLY top-level navigation the founder sees while working.
 *
 * Layout (two flex groups, justify-content: space-between):
 *
 *   [raise(fn)  Chat  Matches (51)  Briefs (2)]      [Upgrade  user  Sign out]
 *
 * Active tab has a solid teal pill background + white text. Counts pulled
 * live from /v1/brain/matches/mine on mount.
 */
type Counts = { matches: number; briefs: number };

const TABS: Array<{ key: "chat" | "matches" | "briefs"; label: string; href: string }> = [
  { key: "chat", label: "Chat", href: "/brain/deploy" },
  { key: "matches", label: "Matches", href: "/brain/matches" },
  { key: "briefs", label: "Briefs", href: "/brain/briefs" },
];

export default function BrainTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState<string>("");

  useEffect(() => {
    try {
      setTier(localStorage.getItem("raisefn_user_tier"));
      // Shared with deploy/page.tsx — the "Acting as" dropdown writes this
      // key. Without reading it here, the counts always reflect the admin's
      // own data even while they're acting as a managed founder.
      setImpersonating(localStorage.getItem("raisefn_impersonating") || "");
    } catch {
      /* private browsing */
    }
    // Listen for changes from deploy/page.tsx so the tabs update when the
    // dropdown is switched mid-session.
    function onImpersonate(e: Event) {
      const ce = e as CustomEvent<{ email?: string | null }>;
      setImpersonating(ce.detail?.email || "");
    }
    window.addEventListener("raisefn:impersonate", onImpersonate);
    return () => window.removeEventListener("raisefn:impersonate", onImpersonate);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        if (!cancelled) setEmail(session.user.email || null);
        const headers: Record<string, string> = {
          Authorization: `Bearer ${session.access_token}`,
        };
        if (impersonating) headers["X-Impersonate"] = impersonating;
        const res = await fetch("/v1/brain/matches/mine", { headers });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        // Count UNIQUE investors across all batches (not just the latest)
        // so the number grows as the founder pulls more batches. Dedup by
        // lowercase trimmed name; falls back to firm_name when name is
        // missing.
        const batches = Array.isArray(data.batches) ? data.batches : [];
        const seen = new Set<string>();
        for (const b of batches) {
          const all = [
            ...(Array.isArray(b.individuals_to_target) ? b.individuals_to_target : []),
            ...(Array.isArray(b.firms_to_consider) ? b.firms_to_consider : []),
          ];
          for (const inv of all) {
            const i = inv as { name?: string; firm_name?: string };
            const key = (i.name || i.firm_name || "").toLowerCase().trim();
            if (key) seen.add(key);
          }
        }
        const matchCount = seen.size;
        const briefCount = Array.isArray(data.briefs) ? data.briefs.length : 0;
        if (!cancelled) setCounts({ matches: matchCount, briefs: briefCount });
      } catch {
        /* counts are best-effort */
      }
    }
    load();

    // Refresh on custom events fired by the chat page when new matches
    // or briefs land. Lets the count update without polling.
    function onUpdate() { load(); }
    window.addEventListener("raisefn:matches_updated", onUpdate);
    window.addEventListener("raisefn:briefs_updated", onUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("raisefn:matches_updated", onUpdate);
      window.removeEventListener("raisefn:briefs_updated", onUpdate);
    };
  }, [pathname, impersonating]);

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

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  // Show upgrade unless we KNOW the user is on a paid tier. Includes the
  // null/undefined case (fresh login before the chat usage SSE has written
  // tier to localStorage) — better to invite an upgrade than silently hide
  // it for someone who would have qualified.
  //
  // Current paid tiers (post-v4 pricing, 2026-06): 'pro', 'advisor'.
  // Legacy strings ('concierge', 'lifetime', 'lifetime_advisor') were
  // never current — Lifetime Advisor was a pre-v4 marketing pitch that
  // never shipped as a tier value. Removed 2026-06-16.
  const PAID_TIERS = new Set(["pro", "advisor"]);
  const showUpgrade = !PAID_TIERS.has(tier || "");
  const TIER_LABEL: Record<string, string> = { pro: "Pro", advisor: "Advisor" };
  const tierLabel = tier && TIER_LABEL[tier] ? TIER_LABEL[tier] : null;
  const displayName = email ? email.split("@")[0] : null;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(9, 9, 11, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #27272a",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* LEFT: logo, flex column with left-aligned content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "18px",
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ color: "#f97316" }}>raise</span>
            <span style={{ color: "#2dd4bf" }}>(fn)</span>
          </Link>
        </div>

        {/* CENTER: tabs, centered in the bar */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <nav style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {TABS.map((tab) => {
              const active = isActive(tab.href);
              const count = countFor(tab.key);
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 14px",
                    fontSize: "14px",
                    fontWeight: active ? 600 : 500,
                    color: active ? "#ffffff" : "#a1a1aa",
                    textDecoration: "none",
                    borderRadius: "7px",
                    background: active ? "#14b8a6" : "transparent",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                    lineHeight: 1.2,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(39, 39, 42, 0.7)";
                      e.currentTarget.style.color = "#f4f4f5";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#a1a1aa";
                    }
                  }}
                >
                  <span>{tab.label}</span>
                  {count !== null && count > 0 && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "20px",
                        height: "18px",
                        padding: "0 6px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: active
                          ? "rgba(255, 255, 255, 0.22)"
                          : "rgba(63, 63, 70, 0.85)",
                        color: active ? "#ffffff" : "#d4d4d8",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* RIGHT: upgrade + user + sign out, flex column with right-aligned content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "14px",
          }}
        >
          {showUpgrade && (
            <Link
              href="/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#fed7aa",
                background: "rgba(124, 45, 18, 0.25)",
                border: "1px solid rgba(194, 65, 12, 0.45)",
                borderRadius: "9999px",
                textDecoration: "none",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(154, 52, 18, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(124, 45, 18, 0.25)";
              }}
            >
              Upgrade
            </Link>
          )}
          {tierLabel && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 600,
                color: "#5eead4",
                background: "rgba(15, 118, 110, 0.2)",
                border: "1px solid rgba(15, 118, 110, 0.45)",
                borderRadius: "9999px",
              }}
              title={`${tierLabel} tier`}
            >
              {tierLabel}
            </span>
          )}
          {displayName && (
            <span style={{ fontSize: "13px", color: "#a1a1aa" }}>{displayName}</span>
          )}
          <button
            onClick={handleSignOut}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontSize: "12px",
              fontFamily: "inherit",
              color: "#71717a",
              cursor: "pointer",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#e4e4e7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#71717a";
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
