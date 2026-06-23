"use client";

import type { ReactNode } from "react";

/**
 * Sidebar section. Status-mirror philosophy:
 *   - EMPTY (no content, no count): dim label, NOT clickable. Just shows
 *     this thing exists.
 *   - FILLED: bright label + count + "→" — entire header is the click
 *     target. Body content (rows, etc.) renders below.
 *
 * Chevron-collapse was removed: the empty/filled distinction already
 * communicates state, and the collapse affordance just added noise.
 */

interface SectionProps {
  title: string;
  count?: number | null;
  /** When set AND section has content (children or count > 0), header
   *  is clickable and opens a slide-over panel. */
  onTitleClick?: () => void;
  children?: ReactNode;
}

export function SidebarSection({ title, count, onTitleClick, children }: SectionProps) {
  const hasChildren = !!children && (!Array.isArray(children) || children.length > 0);
  const hasContent = hasChildren || (typeof count === "number" && count > 0);

  // EMPTY: dim, non-interactive label.
  if (!hasContent) {
    return (
      <div className="sb-section">
        <div className="sb-section-header sb-section-header-empty">
          <span className="sb-section-title">{title}</span>
        </div>
      </div>
    );
  }

  // FILLED + clickable (opens panel).
  if (onTitleClick) {
    return (
      <div className="sb-section">
        <button
          type="button"
          className="sb-section-header sb-section-header-clickable"
          onClick={onTitleClick}
          aria-label={`Open ${title}`}
        >
          <span className="sb-section-title">{title}</span>
          <span className="sb-section-right">
            {typeof count === "number" && count > 0 && (
              <span className="sb-section-count">{count}</span>
            )}
            <span className="sb-section-arrow">→</span>
          </span>
        </button>
        {hasChildren && <div className="sb-section-body">{children}</div>}
      </div>
    );
  }

  // FILLED but no panel (MY RAISE, CONNECTIONS): just label + body.
  return (
    <div className="sb-section">
      <div className="sb-section-header">
        <span className="sb-section-title">{title}</span>
        {typeof count === "number" && count > 0 && (
          <span className="sb-section-count">{count}</span>
        )}
      </div>
      {hasChildren && <div className="sb-section-body">{children}</div>}
    </div>
  );
}
