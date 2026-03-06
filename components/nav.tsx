"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/rounds", label: "Rounds" },
  { href: "/investors", label: "Investors" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          <span className="text-orange-500">raise</span>
          <span className="text-teal-400">(fn)</span>
        </Link>
        <div className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href || (link.href === "/projects" && pathname === "/")
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
