"use client";

// Static design preview for the limit_reached wall card. NOT a real cap
// trigger — just renders the card so the design can be eyeballed
// without having to actually exhaust the free tier.
//
// Usage:
//   /brain/deploy/preview-wall?reason=matches
//   /brain/deploy/preview-wall?reason=briefs
//   /brain/deploy/preview-wall?reason=messages
//
// Defaults to matches. Uses the SAME CSS classes as the production
// wall card (.upgrade-card-tiers, .upgrade-card-tier--pro,
// .upgrade-card-tier--advisor), so visual changes here propagate to
// prod via globals.css.

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { wallCardLeadin } from "@/lib/upgrade-card-copy";

function PreviewInner() {
  const params = useSearchParams();
  const reason = params.get("reason") || "matches";
  const leadin = wallCardLeadin(reason);

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", padding: "48px 24px" }}>
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px", color: "#71717a", fontSize: "12px", fontFamily: "monospace" }}>
          preview · reason={reason} · try ?reason=messages | briefs | matches
        </div>

        <div className="upgrade-card">
          <div className="upgrade-card-leadin">{leadin}</div>

          <div className="upgrade-card-tiers">
            <div className="upgrade-card-tier upgrade-card-tier--pro">
              <div className="upgrade-card-tier-name">Pro</div>
              <div className="upgrade-card-tier-price">$199/mo · cancel anytime</div>
              <div className="upgrade-card-tier-pitch">
                Uncapped product, same brain you already know. The SaaS path.
              </div>
              <ul className="upgrade-card-tier-list">
                <li>Uncapped chat with the brain</li>
                <li>Uncapped investor matches</li>
                <li>Uncapped briefs</li>
                <li>Pipeline + memory across sessions</li>
              </ul>
              <button
                className="upgrade-card-tier-cta"
                onClick={() => alert("preview only — real card opens Stripe checkout")}
              >
                Get Pro — $199/mo
              </button>
            </div>

            <div className="upgrade-card-tier upgrade-card-tier--advisor">
              <div className="upgrade-card-tier-name">Advisor</div>
              <div className="upgrade-card-tier-price">$999/mo × 3 · or $1,999 upfront</div>
              <div className="upgrade-card-tier-pitch">
                Three months with raise(fn) Team in the loop on your raise — guidance from someone who's been there, plus warm intros to our proprietary investor network.
              </div>
              <ul className="upgrade-card-tier-list">
                <li>Warm intros to our proprietary network when there's a match</li>
                <li>Tailored briefs for every investor you target</li>
                <li>Pre-meeting prep + post-meeting debriefs</li>
                <li>Pipeline tracking + weekly check-ins</li>
              </ul>
              <button
                className="upgrade-card-tier-cta"
                onClick={() => alert("preview only — real card opens Stripe checkout")}
              >
                Get Advisor — $999/mo
              </button>
              <div className="upgrade-card-tier-foot">
                No success fees. No equity. Save ~33% with $1,999 upfront.{" "}
                <a href="/legal/engagement">Full engagement letter</a>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreviewWallPage() {
  return (
    <Suspense fallback={<div style={{ color: "#71717a", padding: "48px" }}>Loading…</div>}>
      <PreviewInner />
    </Suspense>
  );
}
