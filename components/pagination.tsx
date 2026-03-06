"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export default function Pagination({ total, limit, offset, hasMore }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  function goTo(newOffset: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("offset", String(newOffset));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between border-t border-zinc-800 px-2 py-3 text-sm text-zinc-400">
      <span>
        {total.toLocaleString()} results — page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => goTo(Math.max(0, offset - limit))}
          disabled={offset === 0}
          className="rounded bg-zinc-800 px-3 py-1 text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        <button
          onClick={() => goTo(offset + limit)}
          disabled={!hasMore}
          className="rounded bg-zinc-800 px-3 py-1 text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
