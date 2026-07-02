"use client";

import type { ReactNode } from "react";

/**
 * Sidebar section. Status-mirror philosophy:
 *   - EMPTY (no content, no count): dim label + arrow, STILL clickable
 *     when onTitleClick is set. Opens the panel which shows helper text
 *     explaining what the section is for. (Prior version made empty
 *     sections non-clickable — friend feedback 2026-07-02 caught that
 *     users couldn't discover what each section does.)
 *   - FILLED: bright label + count + "→" — entire header is the click
 *     target. Body content (rows, etc.) renders below.
 */

interface SectionProps {
  title: string;
  count?: number | null;
  /** When set, header is clickable and opens a slide-over panel —
   *  regardless of whether the section is currently empty or filled. */
  onTitleClick?: () => void;
  children?: ReactNode;
}

export function SidebarSection({ title, count, onTitleClick, children }: SectionProps) {
  const hasChildren = !!children && (!Array.isArray(children) || children.length > 0);
  const hasContent = hasChildren || (typeof count === "number" && count > 0);

  // CLICKABLE (empty OR filled) — always open the panel when onTitleClick
  // is provided. Empty state renders dim (visual state preserved) but
  // click still works so the founder can discover what the section is for.
  if (onTitleClick) {
    return (
      <div className="sb-section">
        <button
          type="button"
          className={`sb-section-header sb-section-header-clickable${hasContent ? "" : " sb-section-header-empty"}`}
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

  // Non-clickable (MY RAISE, CONNECTIONS): just label + body.
  return (
    <div className="sb-section">
      <div className={`sb-section-header${hasContent ? "" : " sb-section-header-empty"}`}>
        <span className="sb-section-title">{title}</span>
        {typeof count === "number" && count > 0 && (
          <span className="sb-section-count">{count}</span>
        )}
      </div>
      {hasChildren && <div className="sb-section-body">{children}</div>}
    </div>
  );
}
