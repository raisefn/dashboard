export default function BrainSharpenLayout({ children }: { children: React.ReactNode }) {
  // Full viewport, covers nav. Same chrome as /brain/deploy so users feel
  // they're inside the product, not on a marketing page. Content scrolls
  // natively within — not a chat surface.
  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 overflow-y-auto">
      {children}
    </div>
  );
}
