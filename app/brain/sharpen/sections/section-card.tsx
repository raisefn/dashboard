"use client";

import { useState, type ReactNode } from "react";
import { StatusBadge } from "./status-badge";
import type { SharpenStatus } from "../types";

interface SectionCardProps {
  title: string;
  whyItMatters: string;
  status: SharpenStatus;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function SectionCard({
  title,
  whyItMatters,
  status,
  children,
  defaultCollapsed = false,
}: SectionCardProps) {
  const [open, setOpen] = useState(!defaultCollapsed);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 mb-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 p-5 sm:p-6 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-zinc-500 leading-relaxed">{whyItMatters}</p>
        </div>
        <span
          className="shrink-0 text-zinc-600 text-xs mt-1.5 transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ▸
        </span>
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-zinc-800/60 pt-5">
          {children}
        </div>
      )}
    </div>
  );
}
