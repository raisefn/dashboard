import type { SharpenStatus } from "../types";

const LABEL: Record<SharpenStatus, string> = {
  strong: "STRONG",
  solid: "SOLID",
  gap: "GAP",
  empty: "EMPTY",
};

const COLOR: Record<SharpenStatus, { dot: string; text: string; bg: string; border: string }> = {
  strong: { dot: "#2dd4bf", text: "#2dd4bf", bg: "rgba(45, 212, 191, 0.08)", border: "rgba(45, 212, 191, 0.3)" },
  solid: { dot: "#34d399", text: "#34d399", bg: "rgba(52, 211, 153, 0.08)", border: "rgba(52, 211, 153, 0.3)" },
  gap: { dot: "#fbbf24", text: "#fbbf24", bg: "rgba(251, 191, 36, 0.08)", border: "rgba(251, 191, 36, 0.3)" },
  empty: { dot: "#52525b", text: "#71717a", bg: "rgba(82, 82, 91, 0.08)", border: "rgba(82, 82, 91, 0.3)" },
};

export function StatusBadge({ status }: { status: SharpenStatus }) {
  const c = COLOR[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest"
      style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: c.dot }}
      />
      {LABEL[status]}
    </span>
  );
}

export function StatusDot({ status }: { status: SharpenStatus }) {
  const c = COLOR[status];
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: c.dot }}
    />
  );
}
