import Link from "next/link";

interface BrainCTAInlineProps {
  text: string;
  buttonText?: string;
}

export default function BrainCTAInline({ text, buttonText = "Get your free assessment" }: BrainCTAInlineProps) {
  return (
    <div className="mt-8 rounded-xl border border-orange-900/20 bg-orange-950/10 p-6">
      <p className="text-sm text-zinc-300 mb-3">{text}</p>
      <Link
        href="/signup"
        className="inline-block rounded-full bg-orange-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-orange-500"
      >
        {buttonText}
      </Link>
    </div>
  );
}
