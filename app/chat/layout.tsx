export default function ChatLayout({ children }: { children: React.ReactNode }) {
  // Chat gets its own minimal layout — no main nav, full viewport
  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col overflow-hidden">
      {children}
    </div>
  );
}
