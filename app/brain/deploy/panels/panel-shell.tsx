"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Generic slide-over panel container. Drives the visual chrome (header,
 * body, animations, close button, ESC handler). Panel-specific content
 * (matches list, investor detail, etc.) is rendered as children.
 *
 * Per .claude/plans/phase_2_v3_slide_over_panels.md:
 * - 60% width on desktop (chat compresses to 40% in the surrounding grid)
 * - Full-screen on mobile (<768px); chat hidden behind it
 * - Closes via ✕ button, ESC key, OR backdrop click (mobile only)
 * - One panel at a time — content swaps inside the same shell when the
 *   parent changes the panel state, so the slide-in animation only runs
 *   once per open/close cycle, not on every content swap.
 */
interface PanelShellProps {
  open: boolean;
  title: string;
  /** Optional left-side breadcrumb crumbs. The last crumb is the active
   * panel; earlier crumbs are clickable (back navigation). */
  breadcrumbs?: { label: string; onClick?: () => void }[];
  onClose: () => void;
  /** Children = the body content (panel-specific). Owns its own scroll. */
  children: ReactNode;
  /** Optional header-right slot (action buttons, count chips, etc.). */
  actions?: ReactNode;
}

export function PanelShell({
  open,
  title,
  breadcrumbs,
  onClose,
  children,
  actions,
}: PanelShellProps) {
  // ESC key closes the panel.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus the panel on open so screen readers announce it + Tab cycles
  // inside the panel instead of the page behind it.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);

  return (
    <>
      <style>{PANEL_SHELL_CSS}</style>
      {/* Mobile-only backdrop. Desktop click-outside doesn't close —
          founders want to read the panel while typing in chat. */}
      {open && (
        <div
          className="panel-mobile-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        ref={ref}
        tabIndex={-1}
        className={`panel-shell${open ? " open" : ""}`}
        role="dialog"
        aria-modal={false}
        aria-label={title}
      >
        <header className="panel-header">
          <div className="panel-header-text">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="panel-breadcrumbs" aria-label="Breadcrumb">
                {breadcrumbs.map((c, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <span key={`${c.label}-${idx}`} className="panel-crumb">
                      {!isLast && c.onClick ? (
                        <button
                          type="button"
                          className="panel-crumb-link"
                          onClick={c.onClick}
                        >
                          {c.label}
                        </button>
                      ) : (
                        <span className={isLast ? "panel-crumb-active" : "panel-crumb-passive"}>
                          {c.label}
                        </span>
                      )}
                      {!isLast && <span className="panel-crumb-sep">▸</span>}
                    </span>
                  );
                })}
              </nav>
            )}
            <h2 className="panel-title">{title}</h2>
          </div>
          <div className="panel-header-actions">
            {actions}
            <button
              type="button"
              className="panel-close"
              onClick={onClose}
              aria-label="Close panel (Esc)"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </header>
        <div className="panel-body">{children}</div>
        {/* Mobile-only floating chat return — visible only when the panel
            is full-screen. Returns to chat without losing panel state
            (close button preserves nothing; this is a "go look at chat
            now" affordance). */}
        <button
          type="button"
          className="panel-mobile-chat-button"
          onClick={onClose}
          aria-label="Return to chat"
        >
          ← Chat
        </button>
      </aside>
    </>
  );
}

const PANEL_SHELL_CSS = `
  .panel-shell {
    background: #09090b;
    border-left: 1px solid #27272a;
    display: flex;
    flex-direction: column;
    min-height: 0;
    transform: translateX(100%);
    transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
    height: 100%;
    overflow: hidden;
    outline: none;
  }
  .panel-shell.open {
    transform: translateX(0);
  }

  .panel-header {
    flex-shrink: 0;
    padding: 12px 16px;
    border-bottom: 1px solid #27272a;
    background: rgba(9, 9, 11, 0.9);
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .panel-header-text {
    flex: 1;
    min-width: 0;
  }
  .panel-breadcrumbs {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 4px;
    font-size: 11px;
    color: #71717a;
  }
  .panel-crumb {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .panel-crumb-link {
    background: none;
    border: none;
    color: #2dd4bf;
    font-family: inherit;
    font-size: 11px;
    padding: 0;
    cursor: pointer;
    transition: color 150ms ease;
  }
  .panel-crumb-link:hover {
    color: #5eead4;
    text-decoration: underline;
  }
  .panel-crumb-passive { color: #71717a; }
  .panel-crumb-active { color: #d4d4d8; }
  .panel-crumb-sep {
    color: #3f3f46;
    font-size: 9px;
  }

  .panel-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #f4f4f5;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .panel-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .panel-close {
    background: none;
    border: 1px solid transparent;
    color: #71717a;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 150ms ease;
  }
  .panel-close:hover {
    color: #f4f4f5;
    background: rgba(63, 63, 70, 0.6);
    border-color: #3f3f46;
  }

  .panel-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 16px 20px 32px;
  }

  .panel-mobile-backdrop {
    display: none;
  }
  .panel-mobile-chat-button {
    display: none;
  }

  @media (max-width: 768px) {
    .panel-mobile-backdrop {
      display: block;
      position: fixed;
      top: 56px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 65;
    }
    .panel-mobile-chat-button {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      position: absolute;
      bottom: 20px;
      right: 20px;
      z-index: 70;
      padding: 10px 16px;
      background: #2dd4bf;
      color: #09090b;
      border: none;
      border-radius: 999px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(45, 212, 191, 0.4);
      transition: transform 150ms ease;
    }
    .panel-mobile-chat-button:hover {
      transform: translateY(-1px);
    }
  }
`;
