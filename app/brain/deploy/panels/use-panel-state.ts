"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * The set of slide-over panels v3 supports. Adding a new panel means
 * extending this union + updating the URL serialization below.
 */
export type Panel =
  | { kind: "matches" }
  | { kind: "investor"; slug: string; from?: Panel }
  | { kind: "briefs" }
  | { kind: "brief"; token: string; from?: Panel }
  | { kind: "documents" }
  | { kind: "document"; id: string; from?: Panel }
  | { kind: "pipeline" };

/**
 * Hook owning the active panel state + URL sync.
 *
 * URL shape (search params on /brain/deploy):
 *   - none                                  → no panel
 *   - ?panel=matches                        → matches list
 *   - ?panel=investor&slug=travis-lindsay   → investor detail
 *   - ?panel=briefs                         → briefs list
 *   - ?panel=brief&token=abc                → brief detail
 *   - ?panel=document&id=xyz                → document preview
 *   - ?panel=pipeline                       → full pipeline
 *
 * Browser back closes the panel (just removes params). Refresh restores
 * it. `from` (for breadcrumb back-nav) is NOT URL-serialized — it's
 * in-memory only, so a hard refresh on an investor detail panel won't
 * show a "Back to Matches" crumb. Acceptable for v3.
 */
export function usePanelState(): {
  panel: Panel | null;
  openPanel: (p: Panel) => void;
  closePanel: () => void;
  /** Navigate to the breadcrumb's `from` (or close if none). */
  popPanel: (p: Panel) => void;
} {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [panel, setPanel] = useState<Panel | null>(null);

  // Hydrate panel state from URL on mount + when search params change
  // externally (e.g. browser back/forward).
  useEffect(() => {
    const next = panelFromSearchParams(searchParams);
    setPanel((prev) => {
      // Preserve in-memory `from` when the URL kind+id match (avoids
      // losing breadcrumb history on rerenders).
      if (prev && next && samePanelIdentity(prev, next)) return prev;
      return next;
    });
  }, [searchParams]);

  const openPanel = useCallback(
    (p: Panel) => {
      setPanel(p);
      router.replace(buildHrefForPanel(p), { scroll: false });
    },
    [router],
  );

  const closePanel = useCallback(() => {
    setPanel(null);
    router.replace("/brain/deploy", { scroll: false });
  }, [router]);

  const popPanel = useCallback(
    (p: Panel) => {
      const target = (p as { from?: Panel }).from || null;
      if (target) {
        setPanel(target);
        router.replace(buildHrefForPanel(target), { scroll: false });
      } else {
        closePanel();
      }
    },
    [router, closePanel],
  );

  return { panel, openPanel, closePanel, popPanel };
}

function panelFromSearchParams(sp: URLSearchParams | ReturnType<typeof useSearchParams>): Panel | null {
  const get = (k: string): string | null =>
    typeof (sp as URLSearchParams).get === "function" ? (sp as URLSearchParams).get(k) : null;
  const kind = get("panel");
  if (!kind) return null;
  switch (kind) {
    case "matches":
      return { kind: "matches" };
    case "briefs":
      return { kind: "briefs" };
    case "documents":
      return { kind: "documents" };
    case "pipeline":
      return { kind: "pipeline" };
    case "investor": {
      const slug = get("slug");
      if (!slug) return null;
      return { kind: "investor", slug };
    }
    case "brief": {
      const token = get("token");
      if (!token) return null;
      return { kind: "brief", token };
    }
    case "document": {
      const id = get("id");
      if (!id) return null;
      return { kind: "document", id };
    }
    default:
      return null;
  }
}

function buildHrefForPanel(p: Panel): string {
  const params = new URLSearchParams();
  params.set("panel", p.kind);
  if (p.kind === "investor") params.set("slug", p.slug);
  if (p.kind === "brief") params.set("token", p.token);
  if (p.kind === "document") params.set("id", p.id);
  return `/brain/deploy?${params.toString()}`;
}

function samePanelIdentity(a: Panel, b: Panel): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "investor" && b.kind === "investor") return a.slug === b.slug;
  if (a.kind === "brief" && b.kind === "brief") return a.token === b.token;
  if (a.kind === "document" && b.kind === "document") return a.id === b.id;
  return true;
}
