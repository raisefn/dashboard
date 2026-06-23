"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

/**
 * The brain product's top bar — shown on /brain/deploy + legacy
 * /brain/matches + /brain/briefs. The marketing global nav is suppressed
 * on these paths.
 *
 * Layout (logo left, account/tier/upgrade/sign-out right). The
 * Chat/Matches/Briefs tabs were removed in Phase 2 v2 — the founder
 * sidebar surfaces match/brief counts directly with click-through to
 * the same views, so the top tabs were pure duplication.
 */
export default function BrainTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const [tier, setTier] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // When the founder is NOT on /brain/deploy (e.g. on the legacy
  // /brain/matches or /brain/briefs page), surface a Back-to-Chat link
  // so they can get back. The sidebar lives only on /brain/deploy.
  const showBackToChat = !!pathname && !pathname.startsWith("/brain/deploy");

  useEffect(() => {
    try {
      setTier(localStorage.getItem("raisefn_user_tier"));
    } catch { /* private browsing */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || cancelled) return;
        setEmail(session.user.email || null);
      } catch { /* defensive */ }
    }
    loadSession();
    return () => { cancelled = true; };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

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
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link
            href="/brain/deploy"
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
          {showBackToChat && (
            <Link
              href="/brain/deploy"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "#a1a1aa",
                textDecoration: "none",
                padding: "5px 10px",
                borderRadius: "6px",
                transition: "color 0.15s ease, background-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#e4e4e7";
                e.currentTarget.style.background = "rgba(39, 39, 42, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#a1a1aa";
                e.currentTarget.style.background = "transparent";
              }}
            >
              ← Back to Chat
            </Link>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
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
