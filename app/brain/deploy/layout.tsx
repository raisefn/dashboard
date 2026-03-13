export default function BrainDeployLayout({ children }: { children: React.ReactNode }) {
  // Full viewport, covers nav — matches chat layout pattern
  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col overflow-hidden">
      {children}
    </div>
  );
}
