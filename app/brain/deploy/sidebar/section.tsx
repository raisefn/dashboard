"use client";

import { useState, type ReactNode } from "react";

/**
 * Generic collapsible section shell for the founder sidebar.
 * Per phase_2_design_language.md:
 *   - Section header: text-muted, size-xs, uppercase, letterspaced
 *   - Count chip: text-default, size-sm, pill with bg #27272a
 *   - Chevron: text-faint, rotates on collapse
 *   - Items: text-default, 13px, two-line by default
 *   - Empty state: muted sentence + optional inject-prompt button
 */

interface SectionProps {
  title: string;
  /** Short subtitle (3-6 words) telling new users what this section is. */
  subtitle?: string;
  count?: number | null;
  defaultOpen?: boolean;
  emptyMessage?: string;
  emptyAction?: { label: string; injectPrompt: string };
  onInjectPrompt?: (prompt: string) => void;
  /**
   * When set, clicking the section TITLE opens a slide-over panel
   * (the chevron handles collapse independently). When unset, clicking
   * anywhere in the header toggles collapse (legacy behavior).
   */
  onTitleClick?: () => void;
  children?: ReactNode;
}

export function SidebarSection({
  title,
  subtitle,
  count,
  defaultOpen = true,
  emptyMessage,
  emptyAction,
  onInjectPrompt,
  onTitleClick,
  children,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = !!children && (!Array.isArray(children) || children.length > 0);

  // Split-control mode: chevron toggles collapse, title opens panel.
  if (onTitleClick) {
    return (
      <div className="sb-section">
        <div className="sb-section-header sb-section-header-split">
          <button
            type="button"
            className="sb-section-chevron-btn"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          >
            <span className={`sb-section-chevron${open ? " open" : ""}`}>▸</span>
          </button>
          <button
            type="button"
            className="sb-section-title-btn"
            onClick={onTitleClick}
            aria-label={`Open ${title}`}
          >
            <span className="sb-section-title">{title}</span>
            {typeof count === "number" && count > 0 && (
              <span className="sb-section-count">{count}</span>
            )}
            <span className="sb-section-open-hint">→</span>
          </button>
        </div>
        {subtitle && <div className="sb-section-subtitle sb-section-subtitle-indent">{subtitle}</div>}
        {open && (
          <div className="sb-section-body">
            {hasChildren ? (
              children
            ) : (
              <div className="sb-section-empty">
                {emptyMessage && <p className="sb-section-empty-msg">{emptyMessage}</p>}
                {emptyAction && onInjectPrompt && (
                  <button
                    type="button"
                    className="sb-section-empty-btn"
                    onClick={() => onInjectPrompt(emptyAction.injectPrompt)}
                  >
                    {emptyAction.label}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Legacy single-button mode: whole header toggles collapse.
  return (
    <div className="sb-section">
      <button
        type="button"
        className="sb-section-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="sb-section-header-text">
          <div className="sb-section-header-title-row">
            <span className={`sb-section-chevron${open ? " open" : ""}`}>▸</span>
            <span className="sb-section-title">{title}</span>
            {typeof count === "number" && count > 0 && (
              <span className="sb-section-count">{count}</span>
            )}
          </div>
          {subtitle && <div className="sb-section-subtitle">{subtitle}</div>}
        </div>
      </button>
      {open && (
        <div className="sb-section-body">
          {hasChildren ? (
            children
          ) : (
            <div className="sb-section-empty">
              {emptyMessage && <p className="sb-section-empty-msg">{emptyMessage}</p>}
              {emptyAction && onInjectPrompt && (
                <button
                  type="button"
                  className="sb-section-empty-btn"
                  onClick={() => onInjectPrompt(emptyAction.injectPrompt)}
                >
                  {emptyAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
