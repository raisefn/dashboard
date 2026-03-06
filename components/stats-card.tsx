interface Props {
  label: string;
  value: string;
  subValue?: string;
  subColor?: string;
}

export default function StatsCard({ label, value, subValue, subColor }: Props) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-white font-mono">
        {value}
      </div>
      {subValue && (
        <div className={`mt-0.5 text-sm ${subColor || "text-zinc-400"}`}>
          {subValue}
        </div>
      )}
    </div>
  );
}
